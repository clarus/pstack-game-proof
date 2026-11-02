From Stdlib Require Import List Arith Lia.
Import ListNotations.

Section Dungeon.
Variables A B C : Prop.

Theorem borrowed_key : A -> A.
Proof. intro HA. exact HA. Qed.

Theorem open_toolbox : (A /\ B) -> A.
Proof. intro H. destruct H as [HA HB]. exact HA. Qed.

Theorem two_locks : A -> B -> A /\ B.
Proof. intros HA HB. split.
- exact HA.
- exact HB.
Qed.

Theorem rearrange_tools : (A /\ B) -> B /\ A.
Proof. intro H. destruct H as [HA HB]. split.
- exact HB.
- exact HA.
Qed.

Theorem choose_exit : B -> A \/ B.
Proof. intro HB. right. exact HB. Qed.

Theorem both_worlds : (A \/ B) -> (A -> C) -> (B -> C) -> C.
Proof. intros H HAC HBC. destruct H as [HA | HB].
- apply HAC. exact HA.
- apply HBC. exact HB.
Qed.

Theorem dungeon_finale : A /\ (B \/ C) -> (A /\ B) \/ (A /\ C).
Proof. intro H. destruct H as [HA HBC]. destruct HBC as [HB | HC].
- left. split. exact HA. exact HB.
- right. split. exact HA. exact HC.
Qed.

Theorem left_is_legal_but_exact_is_wrong : B -> A \/ B.
Proof. intro HB. Fail solve [left; exact HB]. right. exact HB. Qed.
End Dungeon.

Section Workshop.
Variable T : Type.
Variables P Q Key Opens : T -> Prop.
Variable a : T.

Theorem specialize_rule : (forall x : T, P x) -> P a.
Proof. intro H. specialize (H a). exact H. Qed.

Theorem pack_certificate : P a -> exists x : T, P x.
Proof. intro H. exists a. exact H. Qed.

Theorem unpack_certificate : (exists x : T, P x /\ Q x) -> exists x : T, P x.
Proof. intro H. destruct H as [x [HP HQ]]. exists x. exact HP. Qed.

Theorem general_rule : (forall x : T, P x -> Q x) -> forall x : T, P x -> Q x.
Proof. intro H. intros x HP. apply (H x). exact HP. Qed.

Theorem open_gate : (exists x : T, Key x) ->
  (forall x : T, Key x -> Opens x) -> exists x : T, Opens x.
Proof. intros H Hrule. destruct H as [x HK]. exists x. apply (Hrule x). exact HK. Qed.
End Workshop.

Theorem any_tower : forall n : nat, n + 0 = n.
Proof. intro n. induction n as [|n IH].
- reflexivity.
- simpl. rewrite IH. reflexivity.
Qed.

Section Railway.
Variable T : Type.

Theorem attach_empty : forall xs : list T, xs ++ [] = xs.
Proof. intro xs. induction xs as [|x xs IH].
- reflexivity.
- simpl. rewrite IH. reflexivity.
Qed.

Theorem coupled_length : forall xs ys : list T,
  length (xs ++ ys) = length xs + length ys.
Proof. intros xs ys. induction xs as [|x xs IH].
- reflexivity.
- simpl. rewrite IH. reflexivity.
Qed.
End Railway.

Theorem robot_initial : forall initialFuel : nat, 0 + initialFuel = initialFuel.
Proof. intro initialFuel. reflexivity. Qed.

Theorem robot_move_preserves : forall distance fuel initialFuel : nat,
  distance + S fuel = initialFuel -> S distance + fuel = initialFuel.
Proof. intros distance fuel initialFuel H. lia. Qed.

Theorem robot_wait_preserves : forall distance fuel initialFuel : nat,
  distance + fuel = initialFuel -> distance + fuel = initialFuel.
Proof. intros distance fuel initialFuel H. exact H. Qed.

Theorem robot_distance_bound : forall distance fuel initialFuel : nat,
  distance + fuel = initialFuel -> distance <= initialFuel.
Proof. intros distance fuel initialFuel H. lia. Qed.

Theorem broken_move_counterexample : ~ (2 + 0 = 1).
Proof. discriminate. Qed.
