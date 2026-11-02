import copy
import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from verify_graphs import verify, formula
LEVELS=json.loads((Path(__file__).resolve().parents[1]/'src/content/dungeon.json').read_text())

class FaultSensitivity(unittest.TestCase):
    def corrupt(self,index,node_id,mutate):
        level=copy.deepcopy(LEVELS[index])
        mutate(next(n for n in level['nodes'] if n['id']==node_id))
        with self.assertRaises(AssertionError): verify(level)
    def test_wrong_successor_goal(self):
        self.corrupt(0,'n1',lambda n:n['goals'][0].update(conclusion={'kind':'atom','name':'B'}))
    def test_premature_completion(self):
        self.corrupt(0,'n1',lambda n:n.update(complete=True))
    def test_dropped_conjunction_branch(self):
        self.corrupt(2,'n3',lambda n:n['goals'].pop())
    def test_dropped_disjunction_branch(self):
        self.corrupt(5,'n4',lambda n:n['goals'].pop())
    def test_leaked_disjunction_fact(self):
        self.corrupt(5,'n4',lambda n:n['goals'][1]['context'].append({'name':'HA','type':{'kind':'atom','name':'A'}}))
    def test_parser_does_not_silently_drop_unknown_syntax(self):
        with self.assertRaises(AssertionError): formula('forall x, A')
    def test_runtime_wrong_branch_is_detected(self):
        self.corrupt(4,'n1',lambda n:next(a for a in n['actions'] if a['tactic']=='left.').update(next='n2'))

if __name__=='__main__':unittest.main()
