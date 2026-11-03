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


WORKSHOP=json.loads((Path(__file__).resolve().parents[1]/'src/content/workshop.json').read_text())

class WorkshopFaultSensitivity(unittest.TestCase):
    def corrupt(self,index,node_id,mutate):
        level=copy.deepcopy(WORKSHOP[index])
        mutate(next(n for n in level['nodes'] if n['id']==node_id))
        with self.assertRaises(AssertionError): verify(level)
    def test_wrong_witness_identity(self):
        self.corrupt(1,'n2',lambda n:n['goals'][0].update(conclusion=formula('P b')))
    def test_missing_discovered_object(self):
        self.corrupt(2,'n2',lambda n:n['goals'][0]['context'].pop(0))
    def test_wrong_object_type(self):
        self.corrupt(5,'n3',lambda n:next(h for h in n['goals'][0]['context'] if h['name']=='x').update(type=formula('U')))
    def test_out_of_scope_witness_marked_accepted(self):
        self.corrupt(1,'n1',lambda n:next(a for a in n['actions'] if a['tactic']=='exists unseen.').update(next='n2'))
    def test_free_object_captured_by_binder(self):
        self.corrupt(5,'n2',lambda n:next(h for h in n['goals'][0]['context'] if h['name']=='Hall').update(type=formula('forall y : T, R y y')))
    def test_wrong_evidence_object(self):
        self.corrupt(3,'n3',lambda n:next(h for h in n['goals'][0]['context'] if h['name']=='Hboth').update(type=formula('P a /\\ Q a')))
    def test_alpha_equivalence_keeps_free_objects_distinct(self):
        from verify_graphs import bound_identity
        self.assertEqual(bound_identity(formula('forall x : T, R x y')),bound_identity(formula('forall z : T, R z y')))
        self.assertNotEqual(bound_identity(formula('forall x : T, R x y')),bound_identity(formula('forall y : T, R y y')))

if __name__=='__main__':unittest.main()
