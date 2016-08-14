import baseStats from '../baseStats';
import multiplierLevel from '../multiplierLevel';

export function convertIV(id, stam, atk, def, multiplier) {
  const {
    BaseStamina,
    BaseAttack,
    BaseDefense,
  } = baseStats.find((b) => b.id === id);
  const stamina = (BaseStamina + (stam || 0)) * multiplier;
  const attack = (BaseAttack + (atk || 0)) * multiplier;
  const defense = (BaseDefense + (def || 0)) * multiplier;
  return Math.floor(Math.pow(stamina, 0.5) * attack * Math.pow(defense, 0.5) / 10);
}

export function calculateCP(mon) {
  const {
    pokemon_id,
    individual_attack,
    individual_defense,
    individual_stamina,
    cp_multiplier,
    additional_cp_multiplier,
  } = mon;
  const multiplier = cp_multiplier + (additional_cp_multiplier || 0);

  const {
    level
  } = multiplierLevel.find((m) => Math.round(m.multiplier * 1000)/1000 === Math.round(multiplier * 1000)/1000);

  return {
    minCP: convertIV(pokemon_id, 0, 0, 0, multiplier),
    currCP: convertIV(
			pokemon_id, individual_stamina, individual_attack, individual_defense, multiplier
		),
    maxCP: convertIV(pokemon_id, 15, 15, 15, multiplier),
    level: level
  };
}
