'use server';

import { v4 as uuidv4 } from 'uuid';
import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Strength } from '@/domain/value-objects/Strength';
import { getMatchSimulationService } from '@/di/container';

export interface SimulateMatchInput {
  homeTeamName: string;
  homeTeamStrength: number;
  awayTeamName: string;
  awayTeamStrength: number;
}

export interface SimulateMatchOutput {
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  score: string;
  result: 'home' | 'draw' | 'away';
}

export async function simulateMatch(
  input: SimulateMatchInput
): Promise<SimulateMatchOutput> {
  // Create teams
  const homeTeam = Team.create({
    id: uuidv4(),
    name: input.homeTeamName,
    strength: Strength.create(input.homeTeamStrength),
  });

  const awayTeam = Team.create({
    id: uuidv4(),
    name: input.awayTeamName,
    strength: Strength.create(input.awayTeamStrength),
  });

  // Create match
  const match = Match.create({
    id: uuidv4(),
    homeTeam,
    awayTeam,
  });

  // Simulate
  const simulationService = getMatchSimulationService();
  const simulatedMatch = simulationService.simulate(match);

  const matchResult = simulatedMatch.getResult();
  const homeGoals = matchResult?.getHomeGoals() ?? 0;
  const awayGoals = matchResult?.getAwayGoals() ?? 0;

  let result: 'home' | 'draw' | 'away';
  if (matchResult?.isHomeWin()) {
    result = 'home';
  } else if (matchResult?.isAwayWin()) {
    result = 'away';
  } else {
    result = 'draw';
  }

  return {
    homeTeamName: input.homeTeamName,
    awayTeamName: input.awayTeamName,
    homeGoals,
    awayGoals,
    score: simulatedMatch.getScore(),
    result,
  };
}
