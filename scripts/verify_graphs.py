"""Check every shipped proof edge against the pinned RocqIDE XML protocol."""
from pathlib import Path
import hashlib
import json
import os
import re
import select
import subprocess
import time
import tempfile
import shutil
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]

class Rocq:
    def __init__(self):
        self.p = subprocess.Popen(['coqidetop', '-main-channel', 'stdfds', '-q'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.buffer = ''
        self.state = self.call('Init', '<option val="none"/>').find('state_id').attrib['val']
    def close(self):
        self.p.terminate()
        try: self.p.wait(timeout=2)
        except subprocess.TimeoutExpired: self.p.kill(); self.p.wait()
        self.p.stdin.close(); self.p.stdout.close()
    def call(self, name, body='<unit/>'):
        self.p.stdin.write(f'<call val="{name}">{body}</call>\n'.encode()); self.p.stdin.flush()
        deadline = time.monotonic()+10
        while True:
            start = self.buffer.find('<value ')
            end = self.buffer.find('</value>', start)
            if start >= 0 and end >= 0:
                value = ET.fromstring(self.buffer[start:end+8].replace('&nbsp;', '&#160;'))
                self.buffer = self.buffer[end+8:]
                if value.attrib['val'] != 'good': raise ValueError(' '.join(value.itertext()))
                return value
            remaining = deadline-time.monotonic()
            if remaining <= 0 or not select.select([self.p.stdout], [], [], remaining)[0]: raise RuntimeError('Rocq protocol timed out')
            block = os.read(self.p.stdout.fileno(),65536)
            if not block: raise RuntimeError('Rocq protocol closed')
            self.buffer += block.decode()
    def add(self, command):
        body = f'<pair><pair><pair><pair><string>{escape(command)}</string><int>0</int></pair><pair><state_id val="{self.state}"/><bool val="true"/></pair></pair><int>0</int></pair><pair><int>0</int><int>0</int></pair></pair>'
        value = self.call('Add', body)
        self.state = value.find('.//state_id').attrib['val']
        return self.call('Goal')


def formula(text):
    text = text.replace('\u00a0',' ')
    tokens = re.findall(r'->|/\\|\\/|[A-Za-z][A-Za-z0-9_]*|[():,]', text)
    if ''.join(tokens) != re.sub(r'\s','',text): raise AssertionError(f'Unsupported Rocq formula: {text!r}')
    i = 0
    def atom():
        nonlocal i
        t=tokens[i]; i+=1
        if t in ('forall', 'exists'):
            variable=tokens[i]; i+=1
            assert re.fullmatch('[a-z][A-Za-z0-9_]*',variable) and tokens[i]==':', 'Expected typed binder'
            i+=1; domain=tokens[i]; i+=1
            assert re.fullmatch('[A-Z][A-Za-z0-9_]*',domain) and tokens[i]==',', 'Expected binder domain'
            i+=1
            return {'kind':t,'variable':variable,'domain':domain,'body':imp()}
        if t=='(':
            f=imp(); assert tokens[i]==')'; i+=1; return f
        assert re.fullmatch('[A-Z][A-Za-z0-9_]*',t)
        args=[]
        while i<len(tokens) and re.fullmatch('[a-z][A-Za-z0-9_]*',tokens[i]) and tokens[i] not in ('forall','exists'):
            args.append(tokens[i]); i+=1
        return {'kind':'app','name':t,'args':args} if args else {'kind':'atom','name':t}
    def binary(sub, token, kind, recurse):
        nonlocal i
        left=sub()
        if i<len(tokens) and tokens[i]==token:
            i+=1; return {'kind':kind,'left':left,'right':recurse()}
        return left
    def conj(): return binary(atom,'/\\','and',conj)
    def disj(): return binary(conj,'\\/','or',disj)
    def imp(): return binary(disj,'->','implies',imp)
    result=imp(); assert i==len(tokens)
    return result


def state(value, parameters=None):
    parameters = parameters if parameters is not None else [{"name":n,"type":"Prop"} for n in ["A","B","C"]]
    container=value.find('.//goals')
    if container is None: return []
    lists=list(container)
    assert len(lists)==4
    assert not list(lists[1]) and not list(lists[2]) and not list(lists[3]), 'Unexpected background, shelved, or abandoned obligations'
    goals=[]
    for goal in lists[0]:
        fields=list(goal); context=[]; bindings=[]
        for hypothesis in fields[1]:
            raw=''.join(hypothesis.itertext()).replace('\u00a0',' ')
            names, typ=raw.split(':',1)
            assert ':=' not in raw, 'Local definitions are outside the supported graph language'
            for name in names.split(','): bindings.append({'name':name.strip(),'type':typ.strip()})
        normalize=lambda text: re.sub(r'\s','',text)
        assert len(bindings)>=len(parameters), 'Missing theorem parameters'
        for actual, expected in zip(bindings,parameters):
            assert actual['name']==expected['name'] and normalize(actual['type'])==normalize(expected['type']), f'Parameter mismatch: {actual} != {expected}'
        for binding in bindings[len(parameters):]:
            context.append({'name':binding['name'],'type':formula(binding['type'])})
        goals.append({'context':context,'conclusion':formula(''.join(fields[2].itertext()))})
    return goals


def bound_identity(f, binders=()):
    """Ignore only bound-variable spelling; retain free object names and scope."""
    kind=f['kind']
    if kind=='atom': return f
    if kind=='app':
        return {'kind':kind,'name':f['name'],'args':[
            ['bound',list(reversed(binders)).index(arg)] if arg in binders else ['free',arg]
            for arg in f['args']]}
    if kind in ('forall','exists'):
        return {'kind':kind,'domain':f['domain'],'body':bound_identity(f['body'],binders+(f['variable'],))}
    return {'kind':kind,'left':bound_identity(f['left'],binders),'right':bound_identity(f['right'],binders)}

def comparable(goals):
    return [{'context':[{'name':h['name'],'type':bound_identity(h['type'])} for h in g['context']],
             'conclusion':bound_identity(g['conclusion'])} for g in goals]

def compare(value, expected, parameters=None):
    actual=state(value, parameters)
    # Context order is part of the authored display contract.
    assert comparable(actual)==comparable(expected['goals']), f'State mismatch\nRocq: {actual}\nGame: {expected["goals"]}'
    assert expected['complete']==(len(actual)==0), 'Premature completion'


def paths(level):
    nodes={n['id']:n for n in level['nodes']}
    assert len(nodes)==len(level['nodes'])
    incoming={key:0 for key in nodes}
    for node in nodes.values():
        assert len({a['id'] for a in node['actions']})==len(node['actions']), 'Duplicate action ID'
        assert not node['complete'] or not node['actions'], 'Completed node has moves'
        for action in node['actions']:
            if action['next'] is not None:
                assert action['next'] in incoming, 'Missing successor'
                incoming[action['next']]+=1
    assert incoming.get('n0')==0, 'Root must not have incoming moves'
    assert all(count==1 for key,count in incoming.items() if key!='n0'), 'Every non-root node must have one history; merged paths require a stronger checker'
    found={'n0':[]}; queue=['n0']
    while queue:
        ident=queue.pop(0)
        for a in nodes[ident]['actions']:
            if a['next']:
                assert a['next'] in nodes
                if a['next'] not in found:
                    found[a['next']]=found[ident]+[a['tactic']]; queue.append(a['next'])
    assert set(found)==set(nodes), 'Unreachable nodes'
    return nodes,found


def verify(level):
    nodes,traces=paths(level); edges=0
    for ident,trace in traces.items():
        node=nodes[ident]
        checks=node['actions'] or [None]
        for a in checks:
            r=Rocq()
            try:
                parameters=level.get('parameters')
                declaration=' '.join(f'({p["name"]} : {p["type"]})' for p in parameters) if parameters is not None else '(A B C : Prop)'
                value=r.add(f'Theorem test {declaration} : {level["theorem"]}.')
                for command in trace: value=r.add(command)
                compare(value,node, parameters)
                if node['complete']:
                    evars=r.call('Evars')
                    assert not evars.findall('.//evar'), 'Unresolved existential variable'
                    r.add('Qed.')
                if a:
                    edges+=1
                    try: result=r.add(a['tactic'])
                    except ValueError:
                        assert a['next'] is None, f'Accepted action rejected by Rocq: {a}'
                    else:
                        assert a['next'] is not None, f'Rocq accepted a supposedly invalid move: {a}'
                        compare(result,nodes[a['next']], parameters)
            except Exception as error:
                raise AssertionError(f'{level["id"]}/{ident}/{a and a["tactic"]}: {error}') from error
            finally: r.close()
    return {'id':level['id'],'nodes':len(nodes),'edges':edges}


def main():
    version=subprocess.check_output(['coqidetop','--version'],text=True)
    assert re.search(r'version 9\.0\.1\s', version), version
    source=ROOT/'src/content/dungeon.json'; levels=[level for name in ['dungeon','workshop'] for level in json.loads((ROOT/f'src/content/{name}.json').read_text())]
    subprocess.run(['node','scripts/export-proofs.ts'],cwd=ROOT,check=True)
    with tempfile.TemporaryDirectory(prefix='proof-quest-export-') as temp:
        for level in levels:
            name=level['id']+'.v'
            shutil.copyfile(ROOT/'artifacts/solutions'/name,Path(temp)/name)
            subprocess.run(['rocq','compile','-q',name],cwd=temp,check=True,timeout=30)
    report=[]
    for level in levels:
        entry=verify(level); report.append(entry); print(f'PASS {entry}',flush=True)
    out=ROOT/'artifacts'; out.mkdir(exist_ok=True)
    covered=['scripts/workshop-content.ts','src/content/workshop.json','src/environments.ts','src/content/dungeon.json','src/model.ts','scripts/generate-content.ts','scripts/export-proofs.ts','scripts/verify_graphs.py']
    sources={name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in covered}
    (out/'rocq-coverage.json').write_text(json.dumps({'rocq':'9.0.1','checkedAtUtc':datetime.now(timezone.utc).isoformat(),'sources':sources,'sha256':sources['src/content/dungeon.json'],'levels':report,'scope':'All published nodes and edges of the authored propositional and first-order quantifier graphs; not a proof of arbitrary JavaScript programs.'},indent=2)+'\n')
    print('PASS: every authored graph edge checked against Rocq, including rejected moves and terminal Qed.')

if __name__=='__main__': main()
