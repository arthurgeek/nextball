import { describe, it, expect } from 'vitest';
import { Standing } from '@/domain/entities/Standing';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { Form, FormResult } from '@/domain/value-objects/Form';

describe('Standing - Creation', () => {
  it('should create standing with only team', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const standing = Standing.create({ team });

    expect(standing.getTeam()).toBe(team);
    expect(standing.getPlayed()).toBe(0);
    expect(standing.getWon()).toBe(0);
    expect(standing.getDrawn()).toBe(0);
    expect(standing.getLost()).toBe(0);
    expect(standing.getGoalsFor()).toBe(0);
    expect(standing.getGoalsAgainst()).toBe(0);
    expect(standing.getPosition()).toBe(0);
    expect(standing.getPreviousPosition()).toBe(0);
  });

  it('should create standing with all properties', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const form = Form.create();

    const standing = Standing.create({
      team,
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 8,
      form,
      position: 1,
      previousPosition: 2,
    });

    expect(standing.getTeam()).toBe(team);
    expect(standing.getPlayed()).toBe(10);
    expect(standing.getWon()).toBe(7);
    expect(standing.getDrawn()).toBe(2);
    expect(standing.getLost()).toBe(1);
    expect(standing.getGoalsFor()).toBe(20);
    expect(standing.getGoalsAgainst()).toBe(8);
    expect(standing.getForm()).toBe(form);
    expect(standing.getPosition()).toBe(1);
    expect(standing.getPreviousPosition()).toBe(2);
  });

  it('should throw error when played is negative', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    expect(() =>
      Standing.create({
        team,
        played: -1,
      })
    ).toThrow();
  });

  it('should throw error when won is negative', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    expect(() =>
      Standing.create({
        team,
        won: -1,
      })
    ).toThrow();
  });

  it('should throw error when drawn is negative', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    expect(() =>
      Standing.create({
        team,
        drawn: -1,
      })
    ).toThrow();
  });
});

describe('Standing - Calculated Properties', () => {
  it('should calculate points correctly', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      won: 7,
      drawn: 2,
      lost: 1,
    });

    expect(standing.getPoints()).toBe(23); // 7*3 + 2*1 = 23
  });

  it('should calculate goal difference correctly', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      goalsFor: 20,
      goalsAgainst: 8,
    });

    expect(standing.getGoalDifference()).toBe(12); // 20 - 8 = 12
  });

  it('should handle negative goal difference', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      goalsFor: 5,
      goalsAgainst: 15,
    });

    expect(standing.getGoalDifference()).toBe(-10); // 5 - 15 = -10
  });
});

describe('Standing - Immutability', () => {
  it('should return new instance with withPosition', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const standing = Standing.create({ team, position: 5 });

    const newStanding = standing.withPosition(1, 5);

    expect(newStanding).not.toBe(standing);
    expect(newStanding.getPosition()).toBe(1);
    expect(newStanding.getPreviousPosition()).toBe(5);
    expect(standing.getPosition()).toBe(5); // Original unchanged
  });

  it('should use current position as previous when not provided', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const standing = Standing.create({ team, position: 3 });

    const newStanding = standing.withPosition(1);

    expect(newStanding.getPosition()).toBe(1);
    expect(newStanding.getPreviousPosition()).toBe(3);
  });

  it('should return new instance with withForm', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const form1 = Form.create();
    const standing = Standing.create({ team, form: form1 });

    const form2 = Form.create().addResult(FormResult.WIN);
    const newStanding = standing.withForm(form2);

    expect(newStanding).not.toBe(standing);
    expect(newStanding.getForm()).toBe(form2);
    expect(standing.getForm()).toBe(form1); // Original unchanged
  });
});

describe('Standing - Complex Scenarios', () => {
  it('should handle perfect record', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      played: 10,
      won: 10,
      drawn: 0,
      lost: 0,
      goalsFor: 30,
      goalsAgainst: 5,
    });

    expect(standing.getPoints()).toBe(30); // 10 wins * 3 points
    expect(standing.getGoalDifference()).toBe(25);
  });

  it('should handle winless record', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      played: 10,
      won: 0,
      drawn: 3,
      lost: 7,
      goalsFor: 8,
      goalsAgainst: 25,
    });

    expect(standing.getPoints()).toBe(3); // 3 draws * 1 point
    expect(standing.getGoalDifference()).toBe(-17);
  });

  it('should handle mid-table team', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });

    const standing = Standing.create({
      team,
      played: 20,
      won: 8,
      drawn: 6,
      lost: 6,
      goalsFor: 28,
      goalsAgainst: 24,
    });

    expect(standing.getPoints()).toBe(30); // 8*3 + 6*1 = 30
    expect(standing.getGoalDifference()).toBe(4);
  });
});

describe('Standing - Getters', () => {
  it('should return all properties correctly', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const form = Form.create();

    const standing = Standing.create({
      team,
      played: 15,
      won: 10,
      drawn: 3,
      lost: 2,
      goalsFor: 32,
      goalsAgainst: 15,
      form,
      position: 2,
      previousPosition: 3,
    });

    expect(standing.getTeam()).toBe(team);
    expect(standing.getPlayed()).toBe(15);
    expect(standing.getWon()).toBe(10);
    expect(standing.getDrawn()).toBe(3);
    expect(standing.getLost()).toBe(2);
    expect(standing.getGoalsFor()).toBe(32);
    expect(standing.getGoalsAgainst()).toBe(15);
    expect(standing.getForm()).toBe(form);
    expect(standing.getPosition()).toBe(2);
    expect(standing.getPreviousPosition()).toBe(3);
    expect(standing.getPoints()).toBe(33); // 10*3 + 3*1
    expect(standing.getGoalDifference()).toBe(17); // 32 - 15
  });
});
