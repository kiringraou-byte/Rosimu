/**
 * Check if target should be treated as a player in damage calculations
 * This includes both actual players (BL.PC) and [Custom Player]
 * 
 * @param {PlayerData|MonsterData} bl - Entity to check
 */
function is_player_for_battle(bl) {
    return bl.type === BL.PC || (bl.type === BL.MOB && bl.is_custom_player);
}

/**
 * Check if target can have player skills/buffs
 * [Custom Player] returns false here since they use monster debuff system
 * 
 * @param {PlayerData|MonsterData} bl - Entity to check
 */
function is_player_object(bl) {
    return bl.type === BL.PC && !bl.is_custom_player;
}

/**
 * Check if target is an actual monster (not custom player)
 * 
 * @param {PlayerData|MonsterData} bl - Entity to check
 */
function is_monster_object(bl) {
    return bl.type === BL.MOB && !bl.is_custom_player;
}

/**
 * Get status data for a block list entity, whether it's a player or monster
 * @param {PlayerData|MonsterData} bl 
 * @returns {StatusData}
 */
function status_get_status_data(bl) {
    switch(bl.type) {
        case BL.PC:
            return bl.battle_status;
        case BL.MOB:
            return bl.battle_status;
        default:
            console.error(`status_get_status_data: unknown block type ${bl.type}`);
            return new StatusData();
    }
}

/**
 * Check if a status has a specific mode flag set
 * @param {StatusData} status - Status data to check
 * @param {number} mode - Mode flag to check (e.g., MODE.BOSS, MODE.RANGED, etc.)
 */
function status_has_mode(status, mode) {
    return status.mode & mode;
}

function status_get_class(bl) {
    switch(bl.type) {
        case BL.PC: return bl.battle_status.class_;
        case BL.MOB: return bl.mob_id;
    }
    return 1;
}

function status_get_race2(bl) {
    if(is_monster_object(bl))
        return bl.race2;

    return [];
}

function status_get_element(bl) {
    return status_get_status_data(bl).def_ele;
}

/**
 * Modify damage by rate percentage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_RATE macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {number} rate - Rate to modify damage (e.g., 50 for -50%, 150 for +50%)
 */
function ATK_RATER(damage, rate) {
    damage = Math.trunc(damage * rate / 100);
    return damage;
}

/**
 * Modify damage by rate percentage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_RATE macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to modify damage (e.g., 50 for -50%, 150 for +50%)
 */
function ATK_RATE(wd, src, skill_id, rate) {
    wd.damage_min = Math.trunc(wd.damage_min * rate / 100);
    wd.damage_max = Math.trunc(wd.damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min = Math.trunc(wd.damage2_min * rate / 100);
        wd.damage2_max = Math.trunc(wd.damage2_max * rate / 100);
    }
}

/**
 * Modify damage by rate percentage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_RATE macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to modify damage (e.g., 50 for -50%, 150 for +50%)
 */
function CRIT_ATK_RATE(wd, src, skill_id, rate) {
    wd.crit_damage_min = Math.trunc(wd.crit_damage_min * rate / 100);
    wd.crit_damage_max = Math.trunc(wd.crit_damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min = Math.trunc(wd.crit_damage2_min * rate / 100);
        wd.crit_damage2_max = Math.trunc(wd.crit_damage2_max * rate / 100);
    }
}

/**
 * Modify damage by rate percentage
 * Modeled after rAthena's MATK_RATE macro
 * 
 * @param {Damage} ad - Magic damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to modify damage (e.g., 50 for -50%, 150 for +50%)
 */
function MATK_RATE(ad, src, skill_id, rate) {
    ad.damage_min = Math.trunc(ad.damage_min * rate / 100);
    ad.damage_max = Math.trunc(ad.damage_max * rate / 100);
    ad.crit_damage_min = Math.trunc(ad.crit_damage_min * rate / 100);
    ad.crit_damage_max = Math.trunc(ad.crit_damage_max * rate / 100);
}

/**
 * Modify damage and damage2 by different rate percentages
 * Modeled after rAthena's ATK_RATE2 macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to modify right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2 - Rate to modify left-hand damage (e.g., 50 for -50%, 150 for +50%)
 */
function ATK_RATE2(wd, src, skill_id, rate, rate2) {
    wd.damage_min = Math.trunc(wd.damage_min * rate / 100);
    wd.damage_max = Math.trunc(wd.damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min = Math.trunc(wd.damage2_min * rate2 / 100);
        wd.damage2_max = Math.trunc(wd.damage2_max * rate2 / 100);
    }
}

/**
 * Modify damage and damage2 by different rate percentages
 * Modeled after rAthena's ATK_RATE2 macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to modify right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2 - Rate to modify left-hand damage (e.g., 50 for -50%, 150 for +50%)
 */
function CRIT_ATK_RATE2(wd, src, skill_id, rate, rate2) {
    wd.crit_damage_min = Math.trunc(wd.crit_damage_min * rate / 100);
    wd.crit_damage_max = Math.trunc(wd.crit_damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min = Math.trunc(wd.crit_damage2_min * rate2 / 100);
        wd.crit_damage2_max = Math.trunc(wd.crit_damage2_max * rate2 / 100);
    }
}

/**
 * Modify damage and damage2 by different rate percentages
 * Modeled after rAthena's ATK_RATE4 macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to modify min right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate_max - Rate to modify max right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2_min - Rate to modify min left-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2_max - Rate to modify max left-hand damage (e.g., 50 for -50%, 150 for +50%)
 */
function ATK_RATE4(wd, src, skill_id, rate_min, rate_max, rate2_min, rate2_max) {
    wd.damage_min = Math.trunc(wd.damage_min * rate_min / 100);
    wd.damage_max = Math.trunc(wd.damage_max * rate_max / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min = Math.trunc(wd.damage2_min * rate2_min / 100);
        wd.damage2_max = Math.trunc(wd.damage2_max * rate2_max / 100);
    }
}

/**
 * Modify damage and damage2 by different rate percentages
 * Modeled after rAthena's ATK_RATE4 macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to modify min right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate_max - Rate to modify max right-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2_min - Rate to modify min left-hand damage (e.g., 50 for -50%, 150 for +50%)
 * @param {number} rate2_max - Rate to modify max left-hand damage (e.g., 50 for -50%, 150 for +50%)
 */
function CRIT_ATK_RATE4(wd, src, skill_id, rate_min, rate_max, rate2_min, rate2_max) {
    wd.crit_damage_min = Math.trunc(wd.crit_damage_min * rate_min / 100);
    wd.crit_damage_max = Math.trunc(wd.crit_damage_max * rate_max / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min = Math.trunc(wd.crit_damage2_min * rate2_min / 100);
        wd.crit_damage2_max = Math.trunc(wd.crit_damage2_max * rate2_max / 100);
    }
}

/**
 * Add rate percentage to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADDRATE macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50%)
 */
function ATK_ADDRATE(wd, src, skill_id, rate) {
    wd.damage_min += Math.trunc(wd.damage_min * rate / 100);
    wd.damage_max += Math.trunc(wd.damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min += Math.trunc(wd.damage2_min * rate / 100);
        wd.damage2_max += Math.trunc(wd.damage2_max * rate / 100);
    }
}

/**
 * Add rate percentage to damage
 * Modeled after rAthena's MATK_ADDRATE macro
 * 
 * @param {Damage} ad - Magic damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50%)
 */
function MATK_ADDRATE(ad, src, skill_id, rate) {
    ad.damage_min += Math.trunc(ad.damage_min * rate / 100);
    ad.damage_max += Math.trunc(ad.damage_max * rate / 100);
    ad.crit_damage_min += Math.trunc(ad.crit_damage_min * rate / 100);
    ad.crit_damage_max += Math.trunc(ad.crit_damage_max * rate / 100);
}

/**
 * Add rate percentage to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADDRATE macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50%)
 */
function CRIT_ATK_ADDRATE(wd, src, skill_id, rate) {
    wd.crit_damage_min += Math.trunc(wd.crit_damage_min * rate / 100);
    wd.crit_damage_max += Math.trunc(wd.crit_damage_max * rate / 100);
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min += Math.trunc(wd.crit_damage2_min * rate / 100);
        wd.crit_damage2_max += Math.trunc(wd.crit_damage2_max * rate / 100);
    }
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50 flat damage)
 */
function ATK_ADD(wd, src, skill_id, rate) {
    wd.damage_min += rate;
    wd.damage_max += rate;
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min += rate;
        wd.damage2_max += rate;
    }
}

/**
 * Add rate to damage
 * Modeled after rAthena's MATK_ADD macro
 * 
 * @param {Damage} ad - Magic damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50 flat damage)
 */
function MATK_ADD(ad, src, skill_id, rate) {
    ad.damage_min += rate;
    ad.damage_max += rate;
    ad.crit_damage_min += rate;
    ad.crit_damage_max += rate;
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate - Rate to add (e.g., 50 for +50 flat damage)
 */
function CRIT_ATK_ADD(wd, src, skill_id, rate) {
    wd.crit_damage_min += rate;
    wd.crit_damage_max += rate;
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min += rate;
        wd.crit_damage2_max += rate;
    }
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate_max - Rate to add (e.g., 50 for +50 flat damage)
 */
function ATK_ADD2(wd, src, skill_id, rate_min, rate_max) {
    wd.damage_min += rate_min;
    wd.damage_max += rate_max;
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min += rate_min;
        wd.damage2_max += rate_max;
    }
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate_max - Rate to add (e.g., 50 for +50 flat damage)
 */
function CRIT_ATK_ADD2(wd, src, skill_id, rate_min, rate_max) {
    wd.crit_damage_min += rate_min;
    wd.crit_damage_max += rate_max;
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min += rate_min;
        wd.crit_damage2_max += rate_max;
    }
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate_max - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate2_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate2_max - Rate to add (e.g., 50 for +50 flat damage)
 */
function ATK_ADD4(wd, src, skill_id, rate_min, rate_max, rate2_min, rate2_max) {
    wd.damage_min += rate_min;
    wd.damage_max += rate_max;
    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min += rate2_min;
        wd.damage2_max += rate2_max;
    }
}

/**
 * Add rate to damage (and damage2 if left-handed attack)
 * Modeled after rAthena's ATK_ADD macro
 * 
 * @param {Damage} wd - Weapon damage struct to modify
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @param {number} rate_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate_max - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate2_min - Rate to add (e.g., 50 for +50 flat damage)
 * @param {number} rate2_max - Rate to add (e.g., 50 for +50 flat damage)
 */
function CRIT_ATK_ADD4(wd, src, skill_id, rate_min, rate_max, rate2_min, rate2_max) {
    wd.crit_damage_min += rate_min;
    wd.crit_damage_max += rate_max;
    if(is_attack_left_handed(src, skill_id)) {
        wd.crit_damage2_min += rate2_min;
        wd.crit_damage2_max += rate2_max;
    }
}

/**
 * Apply card fix modifier to damage
 * Modeled after rAthena's APPLY_CARDFIX macro
 * 
 * @param {number} damage - Base damage to modify
 * @param {number} fix - Card fix value (e.g., 200 for +20% damage, -100 for -10% damage reduction)
 */
function APPLY_CARDFIX(damage, fix) {
    damage = damage - Math.trunc((damage * (1000 - Math.max(0, fix))) / 1000);
    return damage;
}

/**
 * Apply division fix to damage based on hit count
 * Modeled after rAthena's DAMAGE_DIV_FIX macro
 * 
 * @param {number} dmg - Damage value
 * @param {number} div - Division/hit count
 * @returns {number} Modified damage
 */
function DAMAGE_DIV_FIX(dmg, div) {
    if (div < 0) {
        div *= -1;
        dmg = Math.trunc(dmg / div);
    }
    dmg *= div;
    return dmg;
}

/**
 * Apply division fix to damage based on hit count
 * Modeled after rAthena's DAMAGE_DIV_FIX macro
 * 
 * @param {number} dmg - Damage value
 * @param {number} div - Division/hit count
 * @returns {number} Modified damage
 */
function DAMAGE_DIV_FIX2(dmg, div) {
    if (div > 1) {
        dmg *= div;
    }
    return dmg;
}

/**
 * Get element modifier for attack vs defense
 * @param {number} atk_ele - Attacking element (ELE.NEUTRAL, ELE.WATER, etc.)
 * @param {number} def_ele_lv - Defending element level (1-4)
 * @param {number} def_ele - Defending element (ELE.NEUTRAL, ELE.WATER, etc.)
 * @returns {number} Element modifier (e.g., 2 for 200%, 0.5 for 50%, -0.25 for healing)
 */
function get_element_modifier(atk_ele, def_ele_lv, def_ele) {
    // Element table: [def_ele][def_ele_lv][atk_ele] = modifier
    // Organized by: defending element -> element level -> attacking element
    const ELEMENT_TABLE = {
        [ELE.NEUTRAL]: {
            1: [100, 100, 100, 100, 100, 100, 100, 100, 25, 100, 100],
            2: [100, 100, 100, 100, 100, 100, 100, 100, 0, 100, 100],
            3: [100, 100, 100, 100, 100, 100, 100, 100, 0, 100, 100],
            4: [100, 100, 100, 100, 100, 100, 100, 100, 0, 100, 100]
        },
        [ELE.WATER]: {
            1: [100, 25, 100, 50, 175, 100, 100, 100, 100, 100, 100],
            2: [100, 0, 100, 25, 175, 75, 100, 100, 75, 75, 100],
            3: [100, -25, 100, 0, 200, 50, 100, 100, 50, 50, 100],
            4: [100, -50, 100, 0, 200, 25, 75, 75, 25, 25, 100]
        },
        [ELE.EARTH]: {
            1: [100, 100, 100, 150, 50, 125, 100, 100, 100, 100, 100],
            2: [100, 100, 50, 175, 25, 125, 100, 100, 75, 75, 100],
            3: [100, 100, 0, 200, 0, 100, 100, 100, 50, 50, 100],
            4: [100, 100, -25, 200, 0, 75, 75, 75, 25, 25, 100]
        },
        [ELE.FIRE]: {
            1: [100, 150, 50, 25, 100, 125, 100, 100, 100, 100, 100],
            2: [100, 175, 25, 0, 100, 125, 100, 100, 75, 75, 100],
            3: [100, 200, 0, -25, 100, 100, 100, 100, 50, 50, 100],
            4: [100, 200, 0, -50, 100, 75, 75, 75, 25, 25, 100]
        },
        [ELE.WIND]: {
            1: [100, 50, 150, 100, 25, 125, 100, 100, 100, 100, 100],
            2: [100, 25, 175, 100, 0, 125, 100, 100, 75, 75, 100],
            3: [100, 0, 200, 100, -25, 100, 100, 100, 50, 50, 100],
            4: [100, 0, 200, 100, -50, 75, 75, 75, 25, 25, 100]
        },
        [ELE.POISON]: {
            1: [100, 100, 100, 100, 100, 0, 100, 50, 100, 50, 100],
            2: [100, 100, 100, 100, 100, 0, 100, 25, 75, 25, 100],
            3: [100, 100, 100, 100, 100, 0, 125, 0, 50, 0, 100],
            4: [100, 75, 75, 75, 75, 0, 125, -25, 25, -25, 100]
        },
        [ELE.HOLY]: {
            1: [100, 75, 75, 75, 75, 75, 0, 125, 75, 100, 100],
            2: [100, 50, 50, 50, 50, 50, -25, 150, 50, 125, 100],
            3: [100, 25, 25, 25, 25, 25, -50, 175, 25, 150, 100],
            4: [100, 0, 0, 0, 0, 0, -100, 200, 0, 175, 100]
        },
        [ELE.SHADOW]: {
            1: [100, 100, 100, 100, 100, 50, 125, 0, 75, 0, 100],
            2: [100, 75, 75, 75, 75, 25, 150, -25, 50, 0, 100],
            3: [100, 50, 50, 50, 50, 0, 175, -50, 25, 0, 100],
            4: [100, 25, 25, 25, 25, -25, 200, -100, 0, 0, 100]
        },
        [ELE.GHOST]: {
            1: [25, 100, 100, 100, 100, 100, 100, 100, 125, 100, 100],
            2: [25, 100, 100, 100, 100, 75, 100, 100, 150, 100, 100],
            3: [0, 100, 100, 100, 100, 50, 100, 100, 175, 100, 100],
            4: [0, 100, 100, 100, 100, 25, 100, 100, 200, 100, 100]
        },
        [ELE.UNDEAD]: {
            1: [100, 100, 100, 125, 100, -25, 150, -25, 100, 0, 100],
            2: [100, 100, 100, 150, 100, -50, 175, -50, 125, 0, 100],
            3: [100, 125, 75, 175, 100, -75, 200, -75, 150, 0, 100],
            4: [100, 150, 50, 200, 100, -100, 200, -100, 175, 0, 100]
        }
    };

    // Validate inputs
    if (!ELEMENT_TABLE[def_ele] || !ELEMENT_TABLE[def_ele][def_ele_lv]) {
        console.error(`Invalid element combination: atk_ele=${atk_ele}, def_ele_lv=${def_ele_lv}`);
        return 100; // Default to neutral
    }

    return ELEMENT_TABLE[def_ele][def_ele_lv][atk_ele];
}

/**
 * Check if attack uses left hand
 * 
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {number} skill_id - Skill ID
 * @returns {boolean} True if left-handed attack
 */
function is_attack_left_handed(src, skill_id) {
    if(src) {
        if(!skill_id) {
            let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null

            if(sd) {
                if(sd.weapontype1 == WEAPON.FIST && sd.weapontype2 != WEAPON.FIST)
                    return true;
                if(sd.weapontype1 == WEAPON.KATAR)
                    return true;
            }

            let sstatus = status_get_status_data(src);

            if(sstatus.lhw.atk)
                return true;
        }
    }
    
    return false;
}

function is_attack_right_handed(src, skill_id) {
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null

    if(!skill_id && sd && sd.weapontype1 == WEAPON.FIST && sd.weapontype2 != WEAPON.FIST)
        return false;

    return true;
}

/**
 * Main battle calculation entry point
 * Modeled after rAthena's battle_calc_attack
 * 
 * @param {number} attack_type - Type of attack (BF.WEAPON, BF.MAGIC, BF.MISC)
 * @param {PlayerData|MonsterData} bl - Attacker block list
 * @param {PlayerData|MonsterData} target - Target block list
 * @param {number} skill_id - Skill ID being used
 * @param {number} skill_lv - Skill level
 * @param {number} flag - Additional flags
 * @returns {Damage} Calculated damage structure
 */
function battle_calc_attack(attack_type, bl, target, skill_id, skill_lv, flag) {
    battleDebug && console.log(`%c[battle_calc_attack] START â€” attack_type=${attack_type}, skill_id=${skill_id}, skill_lv=${skill_lv}, flag=${flag}`, 'color: #ff6600; font-weight: bold');
    let d = new Damage();

    // Call appropriate damage calculation function based on attack type
    switch(attack_type) {
        case BF.WEAPON:
            d = battle_calc_weapon_attack(bl, target, skill_id, skill_lv, flag);
            break;
        case BF.MAGIC:
            battleDebug && console.log("HEYYY");
            d = battle_calc_magic_attack(bl, target, skill_id, skill_lv, flag);
            break;
        case BF.MISC:
            d = battle_calc_misc_attack(bl, target, skill_id, skill_lv, flag);
            break;
        default:
            console.error(`battle_calc_attack: unknown attack type! ${attack_type} (skill_id=${skill_id}, skill_lv=${skill_lv})`);
            // Return empty damage struct
            return d;
    }

    battleDebug && console.log(`[battle_calc_attack] After sub-calc â€” damage=${d.getAverageDamage()}, damage2=${d.getAverageDamage2()}, damage_min=${d.damage_min}, damage_max=${d.damage_max}, crit_damage_min=${d.crit_damage_min}, crit_damage_max=${d.crit_damage_max}`);

    // Post-processing: Check if attack missed or was absorbed
    if (d.damage + d.damage2 < 1) {
        // Miss/Absorbed
        // Weapon attacks should go through to cause additional effects
        if (d.dmg_lv === ATK.DEF) {
            d.dmg_lv = ATK.MISS;
        }
        d.dmotion = 0;
        if (bl.type === BL.PC) {
            d.div_ = 1;
        }


    } else {
        // Some skills like Weaponry Research will cause damage even if attack is dodged
        d.dmg_lv = ATK.DEF;
    }

    d.skill_id = skill_id;
    d.skill_lv = skill_lv;

    battleDebug && console.log(`%c[battle_calc_attack] END â€” final damage_min=${d.damage_min}, damage_max=${d.damage_max}, damage2_min=${d.damage2_min}, damage2_max=${d.damage2_max}, crit_damage_min=${d.crit_damage_min}, crit_damage_max=${d.crit_damage_max}, crit_damage2_min=${d.crit_damage2_min}, crit_damage2_max=${d.crit_damage2_max}, dmg_lv=${d.dmg_lv}`, 'color: #ff6600; font-weight: bold');
    battleDebug && console.log(`%c[battle_calc_attack] Final damage details: ${JSON.stringify(d)}`, 'color: #ff6600; font-weight: bold');
    return d;
}

/**
 * Calculate misc attack damage
 * 
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {PlayerData|MonsterData} target - Target
 * @param {number} skill_id - Skill ID
 * @param {number} skill_lv - Skill level
 * @param {number} wflag - Additional flags
 * @returns {Damage} Calculated damage
 */
function battle_calc_misc_attack(src, target, skill_id, skill_lv, mflag) {
    let damage = 0;
    let skill_damage = 0;
    let i, s_ele;
    let ignore_flee = false;
    let ignore_element = false;
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null

    let md = new Damage();
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    battleDebug && console.log("[battle_calc_misc_attack] START skill_id:", skill_id, "skill_lv:", skill_lv, "mflag:", mflag);
    battleDebug && console.log("[battle_calc_misc_attack] src dex:", sstatus.dex, "int:", sstatus.int, "hit:", sstatus.hit);
    battleDebug && console.log("[battle_calc_misc_attack] target vit:", tstatus.vit, "flee:", tstatus.flee, "def_ele:", tstatus.def_ele, "ele_lv:", tstatus.ele_lv);

    md.div_ = skill_get_num(src, skill_id, skill_lv);
    md.dmg_lv = ATK.DEF;
    md.flag = BF.MISC|BF.SKILL;
    md.miscflag = mflag;

    s_ele = battle_get_misc_element(src, target, skill_id, skill_lv, mflag);
    battleDebug && console.log("[battle_calc_misc_attack] s_ele:", s_ele, "div_:", md.div_);

    md.flag |= battle_range_type(src, target, skill_id, skill_lv);

    switch(skill_id) {
        case SKILL.TF_THROWSTONE:
            damage = 0;
            if(sd) 
                md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = 50;
            else
                md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = 30;
            md.flag |= BF.WEAPON;
            break;
        case SKILL.HT_LANDMINE:
        case SKILL.HT_BLASTMINE:
        case SKILL.HT_CLAYMORETRAP:
            damage = Math.trunc((skill_lv * sstatus.dex * (3.0 + status_get_lv(src) / 100.0) * (1.0 + sstatus.int / 35.0)) / 2);
            md.damage_min = damage + Math.trunc(damage * -10 / 100);
            md.damage_max = damage + Math.trunc(damage * 9 / 100);
            md.crit_damage_min = md.damage_min;
            md.crit_damage_max = md.damage_max;
            break;
        case SKILL.HT_BLITZBEAT:
        case SKILL.SN_FALCONASSAULT: {
            let skill;
            if(!sd || !(skill = SkillSearch(SKILL.HT_STEELCROW)))
                skill = 0;

            damage = 80 + skill * 6 + 2 * Math.trunc(sstatus.dex / 10) + 2 * Math.trunc(sstatus.agi / 10) + 2 * Math.trunc(sstatus.luk / 10);
            if(skill_id == SKILL.SN_FALCONASSAULT) {
                damage = DAMAGE_DIV_FIX2(damage, skill_get_num(src, SKILL.HT_BLITZBEAT, 5));
                damage = Math.trunc((damage * (100 + 50 * skill_lv)) / 100);
            }
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            s_ele = sstatus.rhw.ele;
            md.flag |= BF.WEAPON;
        }
        break;
        case SKILL.BA_DISSONANCE:
            damage = 30 + 10 * skill_lv;
            damage += skill_lv * SkillSearch(SKILL.BA_MUSICALLESSON);
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.NPC_SELFDESTRUCTION:
            damage = sstatus.max_hp;
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.NPC_EVILLAND:
            damage = skill_calc_heal(src, target, skill_id, skill_lv, false);
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.ASC_BREAKER: {
            const matk_dmg = sstatus.matk_max;

            let int_dmg = 2.5 * skill_lv * sstatus.int;
            int_dmg = Math.trunc((int_dmg * (100 - tstatus.mdef)) / 100) - tstatus.mdef2;
            int_dmg = Math.max(1, int_dmg);

            md.damage_min = md.damage_max = matk_dmg + int_dmg;
            md.crit_damage_min = md.crit_damage_max = md.damage_max;
            s_ele = sstatus.rhw.ele;
            md.flag |= BF.WEAPON;
            ignore_flee = true;
            break;
            }
        case SKILL.AM_DEMONSTRATION:
            md.damage_min = Math.trunc((1 + 0.3 * skill_lv) * sstatus.matk_min);
            md.damage_max = Math.trunc((1 + 0.3 * skill_lv) * sstatus.matk_max);
            md.crit_damage_min = md.damage_min;
            md.crit_damage_max = md.damage_max;
            break;
        case SKILL.HW_GRAVITATION:
            damage = 200 + 200 * skill_lv;
            if(target.type == BL.MOB && target.mob_id == 44)
                damage = 400;
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.PA_PRESSURE:
            damage = 500 + 300 * skill_lv;
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.CR_ACIDDEMONSTRATION:
            if(tstatus.vit+sstatus.int) {
                damage = Math.trunc((7 * tstatus.vit * sstatus.int * sstatus.int) / (10 * (tstatus.vit + sstatus.int)));
            } else {
                damage = 0;
            }
            if(tsd)
                damage = Math.trunc(damage / 2);
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
        case SKILL.NJ_ZENYNAGE:
            // changed later anyways
            break;
        case SKILL.GS_FLING:
            damage = (sd ? sd.status.job_level : src.level);
            md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = damage;
            break;
    }
    battleDebug && console.log("[battle_calc_misc_attack] after skill switch dmg_min:", md.damage_min, "dmg_max:", md.damage_max);

    if(!skill_ignore_flee(skill_id) && !ignore_flee) {
        if(sc_get(target, SC.FREEZE) || sc_get(target, SC.STUN) || sc_get(target, SC.SLEEP) || sc_get(target, SC.STONE)) { // stun, freeze, petrify, sleep statuses
            md.hit_rate = 100;
        } else {
            let flee = tstatus.flee;
            let hitrate = 80;

            hitrate += sstatus.hit - flee;

            hitrate = cap_value(hitrate, 5, 100);

            md.hit_rate = hitrate;
        }
    }

    md.damage_min += battle_calc_cardfix(BF.MISC, src, target, skill_id, s_ele, 0, md.damage_min, 0, md.flag);
    md.damage_max += battle_calc_cardfix(BF.MISC, src, target, skill_id, s_ele, 0, md.damage_max, 0, md.flag);
    battleDebug && console.log("[battle_calc_misc_attack] after cardfix dmg_min:", md.damage_min, "dmg_max:", md.damage_max);

    if(sd && (skill_id == SKILL.HT_BLITZBEAT || skill_id == SKILL.SN_FALCONASSAULT || skill_id == SKILL.ASC_BREAKER)) {
        md.damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, s_ele, 0, md.damage_min, 2, md.flag);
        md.damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, s_ele, 0, md.damage_max, 2, md.flag);
        md.crit_damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, s_ele, 0, md.crit_damage_min, 2, md.flag);
        md.crit_damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, s_ele, 0, md.crit_damage_max, 2, md.flag);
    }

    if(sd && (i = pc_skillatk_bonus(sd, skill_id))) {
        battleDebug && console.log("[battle_calc_misc_attack] pc_skillatk_bonus:", i);
        md.damage_min += Math.trunc((md.damage_min * i) / 100);
        md.damage_max += Math.trunc((md.damage_max * i) / 100);
    }

    if(tsd && (i = pc_sub_skillatk_bonus(tsd, skill_id))) {
        battleDebug && console.log("[battle_calc_misc_attack] pc_sub_skillatk_bonus:", i);
        md.damage_min -= Math.trunc((md.damage_min * i) / 100);
        md.damage_max -= Math.trunc((md.damage_max * i) / 100);
    }

    if(!skill_ignores_element(skill_id) && !ignore_element) {
        md.damage_min = battle_attr_fix(src, target, md.damage_min, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
        md.damage_max = battle_attr_fix(src, target, md.damage_max, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
        battleDebug && console.log("[battle_calc_misc_attack] after element fix dmg_min:", md.damage_min, "dmg_max:", md.damage_max);
    }

    if(md.getAverageDamage() < 0)
        md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = 0;
    else if(md.getAverageDamage() && is_infinite_defense(src, target, md.flag, skill_id, skill_lv))
        md.damage_min = md.damage_max = md.crit_damage_min = md.crit_damage_max = 1;

    battle_apply_div_fix(md, skill_id);
    battleDebug && console.log("[battle_calc_misc_attack] after div fix dmg_min:", md.damage_min, "dmg_max:", md.damage_max);

    if(c.A8_Skill14.value == 1) { // woe map
        md.damage_min = battle_calc_gvg_damage(src, target, md.damage_min, skill_id, md.flag);
        md.damage_max = battle_calc_gvg_damage(src, target, md.damage_max, skill_id, md.flag);
        battleDebug && console.log("[battle_calc_misc_attack] after GvG fix dmg_min:", md.damage_min, "dmg_max:", md.damage_max);
    }

    battle_do_reflect(BF.MISC, md, src, target, skill_id, skill_lv);

    md.crit_damage_min = md.damage_min;
    md.crit_damage_max = md.damage_max;

    md.element = s_ele;

    battleDebug && console.log("[battle_calc_misc_attack] FINAL dmg_min:", md.damage_min, "dmg_max:", md.damage_max, "hit_rate:", md.hit_rate);
    return md;
}

function battle_get_misc_element(src, target, skill_id, skill_lv, mflag) {
    let element = skill_get_ele(skill_id, skill_lv);

    if(element == ELE.WEAPON)
        element = ELE.NEUTRAL;
    return element;
}

/**
 * Calculate magic attack damage
 * 
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {PlayerData|MonsterData} target - Target
 * @param {number} skill_id - Skill ID
 * @param {number} skill_lv - Skill level
 * @param {number} wflag - Additional flags
 * @returns {Damage} Calculated damage
 */
function battle_calc_magic_attack(src, target, skill_id, skill_lv, mflag) {
    let i = 0;
    let skill_damage = 0;
    let s_ele = 0;
    let imdef = 1;
    let infdef  =1;
    let ad = new Damage();
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    battleDebug && console.log("[battle_calc_magic_attack] START skill_id:", skill_id, "skill_lv:", skill_lv, "mflag:", mflag);
    battleDebug && console.log("[battle_calc_magic_attack] src matk_min:", sstatus.matk_min, "matk_max:", sstatus.matk_max, "int:", sstatus.int, "luk:", sstatus.luk);
    battleDebug && console.log("[battle_calc_magic_attack] target mdef:", tstatus.mdef, "mdef2:", tstatus.mdef2, "def_ele:", tstatus.def_ele, "ele_lv:", tstatus.ele_lv, "race:", tstatus.race);

    ad.damage_min = 1;
    ad.damage_max = 1;
    ad.crit_damage_min = 1;
    ad.crit_damage_max = 1;
    ad.div_ = skill_get_num(src, skill_id, skill_lv);
    ad.flag = BF.MAGIC|BF.SKILL;
    ad.miscflag = mflag;
    ad.dmg_lv = ATK.DEF;

    imdef = skill_ignores_def(skill_id) ? 1 : 0;

    s_ele = battle_get_magic_element(src, target, skill_id, skill_lv, mflag);

    switch(skill_id) {
    }
    
    ad.flag |= battle_range_type(src, target, skill_id, skill_lv);
    infdef = is_infinite_defense(src, target, ad.flag, skill_id, skill_lv) ? 1 : 0;
    battleDebug && console.log("[battle_calc_magic_attack] s_ele:", s_ele, "imdef:", imdef, "infdef:", infdef);

    if(!infdef) {
        let skillratio = 100;
        if(sd)
            skillratio += sd.bonus.skill_ratio;

        ad.damage_min = 0;
        ad.damage_max = 0;
        ad.crit_damage_min = 0;
        ad.crit_damage_max = 0;

        switch(skill_id) {
            case SKILL.AL_HEAL:
            case SKILL.PR_BENEDICTIO:
            case SKILL.PR_SANCTUARY:
                let heal_damage = skill_calc_heal(src, target, skill_id, skill_lv, false);
                ad.damage_min = heal_damage;
                ad.damage_max = heal_damage;
                ad.crit_damage_min = heal_damage;
                ad.crit_damage_max = heal_damage;
                break;
            case SKILL.PR_ASPERSIO:
                ad.damage_min = 40;
                ad.damage_max = 40;
                ad.crit_damage_min = 40;
                ad.crit_damage_max = 40;
                break;
            case SKILL.ALL_RESURRECTION:
            case SKILL.PR_TURNUNDEAD:
                i = 20 * skill_lv + sstatus.luk + sstatus.int + sd.status.base_level + 200 - 200 * (target.mhp_percent / 100); 
                if(i > 700)
                    i = 700;

                // non-success damage
                ad.damage_min = sd.status.base_level + sstatus.int + skill_lv * 10;

                // success damage
                ad.damage_max = tstatus.max_hp;

                ad.damage2_min = i;

                ad.crit_damage_min = ad.damage_min;
                ad.crit_damage_max = ad.damage_max;
                break;
            case SKILL.NPC_DARKBREATH:
                let darkbreath_damage = Math.trunc((tstatus.hp * (skill_lv <= 5 ? 100 / (2 * (6 - skill_lv)) : 50)) / 100);
                ad.damage_min = darkbreath_damage;
                ad.damage_max = darkbreath_damage;
                ad.crit_damage_min = darkbreath_damage;
                ad.crit_damage_max = darkbreath_damage;
                break;
            case SKILL.NPC_EARTHQUAKE:
            case SKILL.NPC_EARTHQUAKE_MELEE:
            case SKILL.NPC_EARTHQUAKE_RANGED:
                if(sd) {
                    let eq_damage = sstatus.batk + sstatus.rhw.atk;
                    ad.damage_min = ad.damage_max = ad.crit_damage_min = ad.crit_damage_max = eq_damage;
                } else {
                    let eq_damage = battle_calc_base_damage(src, sstatus, sstatus.rhw, tstatus.size, 0);
                    ad.damage_min = eq_damage.min;
                    ad.damage_max = eq_damage.max;
                    ad.crit_damage_min = eq_damage.crit_min;
                    ad.crit_damage_max = eq_damage.crit_max;
                    MATK_RATE(ad, src, skill_id, battle_get_atkpercent(src, skill_id));
                }

                let eq_skillrate = 200 + 100 * skill_lv + 100 * Math.trunc(skill_lv / 2) + ((skill_lv > 4) ? 100 : 0);
                MATK_RATE(ad, src, skill_id, eq_skillrate);
                if(!sd && c.BSkillSubNum.value > 0) { // number of players in range
                    ad.damage_min = Math.trunc(ad.damage_min / (1 * c.BSkillSubNum.value));
                    ad.damage_max = Math.trunc(ad.damage_max / (1 * c.BSkillSubNum.value));
                    ad.crit_damage_min = Math.trunc(ad.crit_damage_min / (1 * c.BSkillSubNum.value));
                    ad.crit_damage_max = Math.trunc(ad.crit_damage_max / (1 * c.BSkillSubNum.value));
                }else if(sd && c.SkillSubNum.value > 0) {
                    ad.damage_min = Math.trunc(ad.damage_min / (1 * c.SkillSubNum.value));
                    ad.damage_max = Math.trunc(ad.damage_max / (1 * c.SkillSubNum.value));
                    ad.crit_damage_min = Math.trunc(ad.crit_damage_min / (1 * c.SkillSubNum.value));
                    ad.crit_damage_max = Math.trunc(ad.crit_damage_max / (1 * c.SkillSubNum.value));
                }
                break;
            default: {
                if(sstatus.matk_max > sstatus.matk_min) {
                    ad.damage_min += sstatus.matk_min;
                    ad.damage_max += sstatus.matk_max - 1;
                    ad.crit_damage_min += sstatus.matk_min;
                    ad.crit_damage_max += sstatus.matk_max - 1;
                } else {
                    ad.damage_min += sstatus.matk_min;
                    ad.damage_max += sstatus.matk_min;
                    ad.crit_damage_min += sstatus.matk_min;
                    ad.crit_damage_max += sstatus.matk_min;
                }
                battleDebug && console.log("[battle_calc_magic_attack] base MATK dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

                switch(skill_id) {
                    case SKILL.MG_NAPALMBEAT:
                        skillratio += -30 + 10 * skill_lv;
                        break;
                    case SKILL.MG_FIREBALL:
                        skillratio += -30 + 10 * skill_lv;
                        break;
                    case SKILL.MG_SOULSTRIKE:
                        if(battle_check_undead(tstatus.race, tstatus.def_ele))
                            skillratio += 5 * skill_lv;
                        break;
                    case SKILL.MG_FIREWALL:
                        skillratio -= 50;
                        break;
                    case SKILL.MG_FIREBOLT:
                    case SKILL.MG_COLDBOLT:
                    case SKILL.MG_LIGHTNINGBOLT:
                    case SKILL.SA_FIREBOLT_HINDSIGHT:
                    case SKILL.SA_COLDBOLT_HINDSIGHT:
                    case SKILL.SA_LIGHTNINGBOLT_HINDSIGHT:
                        // nothing yet
                        break;
                    case SKILL.MG_THUNDERSTORM:
                        skillratio -= 20;
                        break;
                    case SKILL.AL_HOLYLIGHT:
						skillratio += 25;
						break;
                    case SKILL.AL_HOLYLIGHT_SL:
                        skillratio += 25;
                        skillratio *= 5;
					case SKILL.AL_RUWACH:
						skillratio += 45;
						break;
					case SKILL.WZ_FROSTNOVA:
						skillratio += -100 + Math.trunc(((100 + skill_lv * 10) * 2) / 3);
						break;
					case SKILL.WZ_FIREPILLAR:
						if (sd && ad.div_ > 0)
							ad.div_ *= -1; //For players, damage is divided by number of hits
						skillratio += -60 + 20 * skill_lv; //20% MATK each hit
						break;
					case SKILL.WZ_SIGHTRASHER:
						skillratio += 20 * skill_lv;
						break;
					case SKILL.WZ_WATERBALL:
						skillratio += 30 * skill_lv;
						break;
					case SKILL.WZ_STORMGUST:
						skillratio += 40 * skill_lv;
						break;
					case SKILL.HW_NAPALMVULCAN:
						skillratio += 25;
						break;
                    case SKILL.SL_STIN:
                        const bonuses = [0, 10, 40, 70];
                        skillratio += (tstatus.size != SZ.SMALL ? -99 : 10 + 30 * (skill_lv - 1) + base_lv);
						break;
					case SKILL.SL_STUN:
                        skillratio += 5 + 15 * (skill_lv - 1) + base_lv;
						break;
					case SKILL.SL_SMA: //Base damage is 40% + lv%
                        let base_lv;
                        if(sd)
                            base_lv = sd.status.base_level;
                        else
                            base_lv = src.level;
						skillratio += -60 + base_lv;
						break;
					case SKILL.NJ_KOUENKA:
						skillratio -= 10;
						break;
					case SKILL.NJ_KAENSIN:
						skillratio -= 50;
						break;
					case SKILL.NJ_BAKUENRYU:
						skillratio += 50 + 150 * skill_lv;
						break;
					case SKILL.NJ_HYOUSENSOU:
						break;
					case SKILL.NJ_HYOUSYOURAKU:
						skillratio += 50 * skill_lv;
						break;
					case SKILL.NJ_RAIGEKISAI:
						skillratio += 60 + 40 * skill_lv;
						break;
					case SKILL.NJ_KAMAITACHI:
						skillratio += 100 * skill_lv;
						break;
					case SKILL.NJ_HUUJIN:
						break;
                    case SKILL.NPC_ENERGYDRAIN:
                        skillratio += 100 * skill_lv;
                        break;
                    case SKILL.WZ_VERMILION:
						skillratio += 20 * skill_lv - 20;
						break;
                    case SKILL.SO_VARETYR_SPEAR:
                        skillratio += -100 + Math.trunc((2 * sstatus.int + Math.trunc((sstatus.int * skill_lv) / 2)) / 3);
                        break;
                    case SKILL.NPC_PULSESTRIKE:
                        skillratio += 100;
                        break;
                    case SKILL.AG_SOUL_VC_STRIKE:
                        skillratio += -100 + 300 * skill_lv;
                        break;
                    case SKILL.AG_FLORAL_FLARE_ROAD:
                        if(skill_lv == 6) {
                            skillratio += -100 + 20;
                            break;
                        }
                        skillratio += -100 + 50 + 740 * skill_lv;
                        break;
                    case SKILL.CD_ARBITRIUM:
                        skillratio += -100 + 1000 * skill_lv;
                        break;
                    case SKILL.CD_ARBITRIUM_ATK:
                        skillratio += -100 + 1750 * skill_lv;
                        break;
                    case SKILL.EM_VENOM_SWAMP:
                        skillratio += -100 + 700 + 1100 * skill_lv;
                        break;
                    case SKILL.WM_REVERBERATION:
                        skillratio += -100 + 700 + 300 * skill_lv;
                        break;
                }

                battleDebug && console.log("[battle_calc_magic_attack] skillratio:", skillratio);
                MATK_RATE(ad, src, skill_id, skillratio);
                battleDebug && console.log("[battle_calc_magic_attack] after MATK_RATE dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

                // constant/misc additions from skills
                if(skill_id == SKILL.WZ_FIREPILLAR)
                    MATK_ADD(ad, src, skill_id, 100 + 50 * skill_lv);
                break;
            }
        }

        if(sd) {
            if((i = pc_skillatk_bonus(sd, skill_id))) {
                battleDebug && console.log("[battle_calc_magic_attack] pc_skillatk_bonus:", i);
                ad.damage_min += Math.trunc((ad.damage_min * i) / 100);
                ad.damage_max += Math.trunc((ad.damage_max * i) / 100);
                ad.crit_damage_min += Math.trunc((ad.crit_damage_min * i) / 100);
                ad.crit_damage_max += Math.trunc((ad.crit_damage_max * i) / 100);
            }

            if(!imdef && !status_has_mode(tstatus, MD.IGNOREIGNOREMDEF) && (
                sd.indexed_bonus.ignore_mdef_ele[tstatus.def_ele] > 0 || sd.indexed_bonus.ignore_mdef_ele[ELE.MAX] > 0 ||
                sd.indexed_bonus.ignore_mdef_race[tstatus.race] > 0 || sd.indexed_bonus.ignore_mdef_race[RC.ALL] > 0 ||
                sd.indexed_bonus.ignore_mdef_class[tstatus.class_] > 0 || sd.indexed_bonus.ignore_mdef_class[CLASS.ALL] > 0
            ))
                imdef = 1;
        }
        battleDebug && console.log("[battle_calc_magic_attack] before mdef calc - imdef:", imdef, "dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

        if(tsd && (i = pc_sub_skillatk_bonus(tsd, skill_id))) {
            ad.damage_min -= Math.trunc((ad.damage_min * i) / 100);
            ad.damage_max -= Math.trunc((ad.damage_max * i) / 100);
            ad.crit_damage_min -= Math.trunc((ad.crit_damage_min * i) / 100);
            ad.crit_damage_max -= Math.trunc((ad.crit_damage_max * i) / 100);
        }

        // mdef calculation
        if(!imdef) {
            // bonuses ignoring mdef are added together
            let mdef = tstatus.mdef;
            let mdef2 = tstatus.mdef2;

            i = 0;

            if(sd) {
                i += sd.indexed_bonus.ignore_mdef_by_race[tstatus.race] + sd.indexed_bonus.ignore_mdef_by_race[RC.ALL] +
                    sd.indexed_bonus.ignore_mdef_by_ele[tstatus.def_ele] + sd.indexed_bonus.ignore_mdef_by_ele[ELE.MAX] +
                    sd.indexed_bonus.ignore_mdef_by_class[tstatus.class_] + sd.indexed_bonus.ignore_mdef_by_class[CLASS.ALL];

                let race2 = status_get_race2(target);

                for(const it of race2) 
                    i += sd.indexed_bonus.ignore_mdef_by_race2[it];

                if(status_has_mode(tstatus, MD.IGNOREIGNOREMDEF))
                    i = 0;
            }

            i = cap_value(i, 0, 100);

            if(i > 0)
                mdef -= Math.trunc((mdef * i) / 100);

            if(mdef < 0)
                mdef = 0;

            battleDebug && console.log("[battle_calc_magic_attack] mdef:", mdef, "mdef2:", mdef2, "ignore_mdef%:", i);
            ad.damage_min = Math.trunc((ad.damage_min * (100 - mdef)) / 100) - mdef2;
            ad.damage_max = Math.trunc((ad.damage_max * (100 - mdef)) / 100) - mdef2;
            battleDebug && console.log("[battle_calc_magic_attack] after mdef dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);
        }

        i = 0; // pc_skillatk_bonus ratio

        // apply physical part of skill's damage
        switch(skill_id) {
            case SKILL.CR_GRANDCROSS:
            case SKILL.NPC_GRANDDARKNESS: {
                let wd = initialize_weapon_data(src, target, skill_id, skill_lv, 0);
                battle_calc_skill_base_damage(wd, src, target, skill_id, skill_lv);

                battle_calc_defense_reduction(wd, src, target, skill_id, skill_lv);
                if(sd) {
                    wd.damage_min += sstatus.rhw.atk2;
                    wd.damage_max += sstatus.rhw.atk2;
                    wd.crit_damage_min += sstatus.rhw.atk2;
                    wd.crit_damage_max += sstatus.rhw.atk2;
                }

                battleDebug && console.log("[battle_calc_magic_attack] GRAND CROSS physical part - damage_min:", wd.damage_min, "damage_max:", wd.damage_max, "crit_damage_min:", wd.crit_damage_min, "crit_damage_max:", wd.crit_damage_max);
                battleDebug && console.log("[battle_calc_magic_attack] GRAND CROSS magic part before combination - damage_min:", ad.damage_min, "damage_max:", ad.damage_max, "crit_damage_min:", ad.crit_damage_min, "crit_damage_max:", ad.crit_damage_max);
                // combine atk and matk
                ad.damage_min = Math.max(1, wd.damage_min + ad.damage_min);
                ad.damage_max = Math.max(1, wd.damage_max + ad.damage_max);
                ad.crit_damage_min = Math.max(1, wd.crit_damage_min + ad.crit_damage_min);
                ad.crit_damage_max = Math.max(1, wd.crit_damage_max + ad.crit_damage_max);

                battleDebug && console.log("[battle_calc_magic_attack] GRAND CROSS combined damage - damage_min:", ad.damage_min, "damage_max:", ad.damage_max, "crit_damage_min:", ad.crit_damage_min, "crit_damage_max:", ad.crit_damage_max);
                skillratio += 40 * skill_lv;
                MATK_RATE(ad, src, skill_id, skillratio);
                battleDebug && console.log("[battle_calc_magic_attack] GRAND CROSS after MATK_RATE - damage_min:", ad.damage_min, "damage_max:", ad.damage_max, "crit_damage_min:", ad.crit_damage_min, "crit_damage_max:", ad.crit_damage_max);
                break;
            }
        }

        if(ad.damage_min < 1)
            ad.damage_min = 1;
        if(ad.damage_max < 1)
            ad.damage_max = 1;
        if(ad.crit_damage_min < 1)
            ad.crit_damage_min = 1;
        if(ad.crit_damage_max < 1)
            ad.crit_damage_max = 1;

        if(!skill_ignores_element(skill_id)) {
            ad.damage_min = battle_attr_fix(src, target, ad.damage_min, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
            ad.damage_max = battle_attr_fix(src, target, ad.damage_max, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
            ad.crit_damage_min = battle_attr_fix(src, target, ad.crit_damage_min, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
            ad.crit_damage_max = battle_attr_fix(src, target, ad.crit_damage_max, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
            battleDebug && console.log("[battle_calc_magic_attack] after element fix dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);
        }

        ad.damage_min += battle_calc_cardfix(BF.MAGIC, src, target, skill_id, s_ele, 0, ad.damage_min, 0, ad.flag);
        ad.damage_max += battle_calc_cardfix(BF.MAGIC, src, target, skill_id, s_ele, 0, ad.damage_max, 0, ad.flag);
        ad.crit_damage_min += battle_calc_cardfix(BF.MAGIC, src, target, skill_id, s_ele, 0, ad.crit_damage_min, 0, ad.flag);
        ad.crit_damage_max += battle_calc_cardfix(BF.MAGIC, src, target, skill_id, s_ele, 0, ad.crit_damage_max, 0, ad.flag);
        battleDebug && console.log("[battle_calc_magic_attack] after cardfix dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

        switch(skill_id) {
            case SKILL.CR_GRANDCROSS:
            case SKILL.NPC_GRANDDARKNESS:
                if(src == target) {
                    ad.damage_min = Math.trunc(ad.damage_min / 2);
                    ad.damage_max = Math.trunc(ad.damage_max / 2);
                    ad.crit_damage_min = Math.trunc(ad.crit_damage_min / 2);
                    ad.crit_damage_max = Math.trunc(ad.crit_damage_max / 2);
                } else {
                    ad.damage_min = battle_attr_fix(src, target, ad.damage_min, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
                    ad.damage_max = battle_attr_fix(src, target, ad.damage_max, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
                    ad.crit_damage_min = battle_attr_fix(src, target, ad.crit_damage_min, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
                    ad.crit_damage_max = battle_attr_fix(src, target, ad.crit_damage_max, s_ele, tstatus.def_ele, tstatus.ele_lv, 0);
                }

                break;
        }
    }
    
    battle_apply_div_fix(ad, skill_id);
    battleDebug && console.log("[battle_calc_magic_attack] after div fix dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

    ad.damage_min = battle_calc_damage(src, target, ad, ad.damage_min, skill_id, skill_lv);
    ad.damage_max = battle_calc_damage(src, target, ad, ad.damage_max, skill_id, skill_lv);
    ad.crit_damage_min = battle_calc_damage(src, target, ad, ad.crit_damage_min, skill_id, skill_lv);
    ad.crit_damage_max = battle_calc_damage(src, target, ad, ad.crit_damage_max, skill_id, skill_lv);
    battleDebug && console.log("[battle_calc_magic_attack] after battle_calc_damage dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);

    if(c.A8_Skill14.value == 1) { // woe map
        ad.damage_min = battle_calc_gvg_damage(src, target, ad.damage_min, skill_id, ad.flag);
        ad.damage_max = battle_calc_gvg_damage(src, target, ad.damage_max, skill_id, ad.flag);
        ad.crit_damage_min = battle_calc_gvg_damage(src, target, ad.crit_damage_min, skill_id, ad.flag);
        ad.crit_damage_max = battle_calc_gvg_damage(src, target, ad.crit_damage_max, skill_id, ad.flag);
        battleDebug && console.log("[battle_calc_magic_attack] after GvG fix dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max);
    }

    // special "conditions" where skills cannot be used on a target, set damage to 0
    switch(skill_id) {
        case SKILL.AL_HEAL:
        case SKILL.PR_TURNUNDEAD:
        case SKILL.ALL_RESURRECTION:
        case SKILL.PR_ASPERSIO:
            if(!battle_check_undead(tstatus.race, tstatus.def_ele))
                ad.damage_min = ad.damage_max = ad.crit_damage_min = ad.crit_damage_max = 0;
            break;
        case SKILL.PR_SANCTUARY:
            if(!battle_check_undead(tstatus.race, tstatus.def_ele) && tstatus.race != RC.DEMON)
                ad.damage_min = ad.damage_max = ad.crit_damage_min = ad.crit_damage_max = 0;
            break;
    }

    ad.element = s_ele;

    battleDebug && console.log("[battle_calc_magic_attack] FINAL dmg_min:", ad.damage_min, "dmg_max:", ad.damage_max, "crit_min:", ad.crit_damage_min, "crit_max:", ad.crit_damage_max);
    return ad;
}

function battle_get_magic_element(src, target, skill_id, skill_lv, mflag) {
    let element = skill_get_ele(skill_id, skill_lv);
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let sstatus = status_get_status_data(src);

    if(element == ELE.WEAPON) {
        element = sstatus.rhw.ele;
    }

    switch(skill_id) {
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHQUAKE_MELEE:
        case SKILL.NPC_EARTHQUAKE_RANGED:
            element = ELE.NEUTRAL;
            break;
        case SKILL.WM_REVERBERATION:
            if(sd)
                element = sd.bonus.arrow_ele;
            break;
    }

    return element;
}

/**
 * Calculate weapon (physical) attack damage
 * 
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {PlayerData|MonsterData} target - Target
 * @param {number} skill_id - Skill ID
 * @param {number} skill_lv - Skill level
 * @param {number} wflag - Additional flags
 * @returns {Damage} Calculated damage
 */
function battle_calc_weapon_attack(src, target, skill_id, skill_lv, wflag) {
    battleDebug && console.log(`%c[battle_calc_weapon_attack] START â€” skill_id=${skill_id}, skill_lv=${skill_lv}, wflag=${wflag}`, 'color: #00cc00; font-weight: bold');
    let wd = new Damage();
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let right_element, left_element = 0;
    let infdef = false;
    
    wd = initialize_weapon_data(src, target, skill_id, skill_lv, wflag);
    battleDebug && console.log(`[battle_calc_weapon_attack] After initialize_weapon_data â€” div_=${wd.div_}, flag=${wd.flag}, type=${wd.type}`);

    right_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_R);
    left_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_L);
    battleDebug && console.log(`[battle_calc_weapon_attack] Elements â€” right=${right_element}, left=${left_element}`);
    
    battle_calc_multi_attack(wd, src, target, skill_id, skill_lv);
    battleDebug && console.log(`[battle_calc_weapon_attack] After multi_attack â€” div_=${wd.div_}, type=${wd.type}, multi_attack_rate=${wd.multi_attack_rate}`);

    // Now simply sets the critical rate of the crit damage 
    is_attack_critical(wd, src, target, skill_id, skill_lv, true);

    if(!is_attack_hitting(wd, src, target, skill_id, skill_lv, true)) {
        battleDebug && console.log(`[battle_calc_weapon_attack] Attack MISSED`);
        wd.dmg_lv = ATK.FLEE;
    } else if(!(infdef = is_infinite_defense(src, target, wd.flag, skill_id, skill_lv))) {
        // first call function with id 0 to get base damage of a normal attack for damage calculation
        battle_calc_skill_base_damage(wd, src, target, 0, 0);
        wd.basedamage_min = wd.damage_min;
        wd.basedamage_max = wd.damage_max;
        wd.crit_basedamage_min = wd.crit_damage_min;
        wd.crit_basedamage_max = wd.crit_damage_max;
        battleDebug && console.log(`[battle_calc_weapon_attack] Base normal atk â€” basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
        // now actual skill damage
        if(skill_id != SKILL.NV_BASIC_ATTACK)
            battle_calc_skill_base_damage(wd, src, target, skill_id, skill_lv);
        battleDebug && console.log(`[battle_calc_weapon_attack] After skill_base_damage â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);

        ATK_RATE(wd, src, skill_id, battle_calc_attack_skill_ratio(wd, src, target, skill_id, skill_lv));
        CRIT_ATK_RATE(wd, src, skill_id, battle_calc_attack_skill_ratio(wd, src, target, skill_id, skill_lv));
        battleDebug && console.log(`[battle_calc_weapon_attack] After skill_ratio ATK_RATE â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        ATK_ADD2(wd, src, skill_id, battle_calc_skill_constant_addition(wd, src, target, skill_id, skill_lv).min, battle_calc_skill_constant_addition(wd, src, target, skill_id, skill_lv).max);
        CRIT_ATK_ADD2(wd, src, skill_id, battle_calc_skill_constant_addition(wd, src, target, skill_id, skill_lv).min, battle_calc_skill_constant_addition(wd, src, target, skill_id, skill_lv).max);
        battleDebug && console.log(`[battle_calc_weapon_attack] After skill_constant_addition â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);

        let i = 0;

        if(sd && skill_id && (i = pc_skillatk_bonus(src, skill_id))) {
            battleDebug && console.log(`[battle_calc_weapon_attack] pc_skillatk_bonus=${i}`);
            ATK_ADDRATE(wd, src, skill_id, i);
            CRIT_ATK_ADDRATE(wd, src, skill_id, i);
        }
        if(tsd && (i = pc_sub_skillatk_bonus(tsd, skill_id))) {
            ATK_ADDRATE(wd, src, skill_id, -i);
            CRIT_ATK_ADDRATE(wd, src, skill_id, -i);
             battleDebug && console.log(`[battle_calc_weapon_attack] pc_sub_skillatk_bonus=${i}`);
        }

        // final attack bonuses not affected by cards
        battle_attack_sc_bonus(wd, src, target, skill_id, skill_lv);
        battleDebug && console.log(`[battle_calc_weapon_attack] After sc_bonus â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);

        if((wd.getAverageDamage() + wd.getAverageDamage2()) || (wd.getAverageCritDamage() + wd.getAverageCritDamage2())) {
            if(skill_id != SKILL.PA_SHIELDCHAIN && skill_id != SKILL.CR_SHIELDBOOMERANG && skill_id != SKILL.CR_SHIELDBOOMERANG_SL) {
                battle_calc_defense_reduction(wd, src, target, skill_id, skill_lv);
                battleDebug && console.log(`[battle_calc_weapon_attack] After defense_reduction â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
            }

            battle_calc_attack_post_defense(wd, src, target, skill_id, skill_lv);
            battleDebug && console.log(`[battle_calc_weapon_attack] After post_defense â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        }
    }

    battle_calc_element_damage(wd, src, target, skill_id, skill_lv);
    battleDebug && console.log(`[battle_calc_weapon_attack] After element_damage â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);

    switch(skill_id) {
        case SKILL.TK_DOWNKICK:
        case SKILL.TK_STORMKICK:
        case SKILL.TK_TURNKICK:
        case SKILL.TK_COUNTER:
            if(sd && sd.weapontype1 == WEAPON.FIST && sd.weapontype2 == WEAPON.FIST) {
                ATK_ADD(wd, src, skill_id, 10 * SkillSearch(SKILL.TK_RUN));
                CRIT_ATK_ADD(wd, src, skill_id, 10 * SkillSearch(SKILL.TK_RUN));
            }
            break; 
    }

    if(sd) {
        let skill;

        if((skill = SkillSearch(SKILL.BS_WEAPONRESEARCH)) > 0) {
            battleDebug && console.log(`[battle_calc_weapon_attack] Weapon Research bonus: +${skill * 2}`);
            ATK_ADD(wd, src, skill_id, skill * 2);
            CRIT_ATK_ADD(wd, src, skill_id, skill * 2);
        }
        if(skill_id == SKILL.GS_GROUNDDRIFT) {
            ATK_ADD(wd, src, skill_id, 50 * skill_lv);
            CRIT_ATK_ADD(wd, src, skill_id, 50 * skill_lv);
        }
        if(skill_id != SKILL.MC_CARTREVOLUTION && SkillSearch(SKILL.BS_HILTBINDING) > 0) {
            ATK_ADD(wd, src, skill_id, 4);
            CRIT_ATK_ADD(wd, src, skill_id, 4);
        }

        battleDebug && console.log(`[battle_calc_weapon_attack] Before src cardfix â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        switch(skill_id) {
            default:
                wd.damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage_min, 2, wd.flag);
                wd.damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage_max, 2, wd.flag);

                wd.crit_damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage_min, 2, wd.flag);
                wd.crit_damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage_max, 2, wd.flag);
                if(is_attack_left_handed(src, skill_id)) {
                    wd.damage2_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage2_min, 3, wd.flag);
                    wd.damage2_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage2_max, 3, wd.flag);

                    wd.crit_damage2_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage2_min, 3, wd.flag);
                    wd.crit_damage2_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage2_max, 3, wd.flag);
                }
                break;
        }
        battleDebug && console.log(`[battle_calc_weapon_attack] After src cardfix â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    }

    if(tsd) {
        battleDebug && console.log(`[battle_calc_weapon_attack] Before target cardfix â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        wd.damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage_min, 0, wd.flag);
        wd.damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage_max, 0, wd.flag);

        wd.crit_damage_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage_min, 0, wd.flag);
        wd.crit_damage_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage_max, 0, wd.flag);
        if(is_attack_left_handed(src, skill_id)) {
            wd.damage2_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage2_min, 1, wd.flag);
            wd.damage2_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.damage2_max, 1, wd.flag);

            wd.crit_damage2_min += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage2_min, 1, wd.flag);
            wd.crit_damage2_max += battle_calc_cardfix(BF.WEAPON, src, target, skill_id, right_element, left_element, wd.crit_damage2_max, 1, wd.flag);
        }
        battleDebug && console.log(`[battle_calc_weapon_attack] After target cardfix â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    }

    if(infdef) {
        battleDebug && console.log(`[battle_calc_weapon_attack] Infinite defense (plant) â€” calling battle_calc_attack_plant`);
        battle_calc_attack_plant(wd, src, target, skill_id, skill_lv);

        return wd;
    }

    battle_apply_div_fix(wd, skill_id);
    battleDebug && console.log(`[battle_calc_weapon_attack] After div_fix â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, div_=${wd.div_}`);

    battle_calc_attack_left_right_hands(wd, src, target, skill_id, skill_lv);
    battleDebug && console.log(`[battle_calc_weapon_attack] After left_right_hands â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);

    battle_calc_attack_gvg_bg(wd, src, target, skill_id, skill_lv);
    battleDebug && console.log(`[battle_calc_weapon_attack] After gvg_bg â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);

    battle_calc_weapon_final_atk_modifiers(wd, src, target, skill_id, skill_lv);
    battleDebug && console.log(`%c[battle_calc_weapon_attack] END â€” final damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`, 'color: #00cc00; font-weight: bold');

    wd.element = right_element;

    // set damage to 0 for skills that cannot hit the target due to special conditions
    switch(skill_id) {
        case SKILL.HT_POWER:
            if(tstatus.race != RC.BRUTE && tstatus.race != RC.INSECT) {
                wd.damage_min = wd.damage_max = wd.crit_damage_min = wd.crit_damage_max = 0;
            }
            break;
        case SKILL.CR_SHIELDCHARGE:
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
        case SKILL.PA_SHIELDCHAIN:
            if(sd && sd.equip[EQI.SHIELD] == 305) // no shield equipped
                wd.damage_min = wd.damage_max = wd.crit_damage_min = wd.crit_damage_max = 0;
            break;
        case SKILL.SG_SUN_WARM_HEAT:
            if(sd && monster.is_custom_player)
                wd.damage_min = wd.damage_max = wd.crit_damage_min = wd.crit_damage_max = 0;
            break;
    }

    battle_do_reflect(BF.WEAPON, wd, src, target, skill_id, skill_lv);

    return wd;
}

/**
 * 
 * @param {BF} attack_type 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_do_reflect(attack_type, wd, src, target, skill_id, skill_lv) {
    if((wd.getAverageDamage() + wd.getAverageDamage2()) && src && target && src != target) {
        let damage_min = wd.damage_min + wd.damage2_min;
        let damage_max = wd.damage_max + wd.damage2_max;

        let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null

        let rdamage_min = battle_calc_return_damage(target, src, damage_min, wd.flag, skill_id, false);
        let rdamage_max = battle_calc_return_damage(target, src, damage_max, wd.flag, skill_id, false);

        wd.item_reflect_damage_min = rdamage_min;
        wd.item_reflect_damage_max = rdamage_max;

        damage_min = wd.damage_min + wd.damage2_min;
        damage_max = wd.damage_max + wd.damage2_max;

        rdamage_min = battle_calc_return_damage(target, src, damage_min, wd.flag, skill_id, true);
        rdamage_max = battle_calc_return_damage(target, src, damage_max, wd.flag, skill_id, true);

        wd.status_reflect_damage_min = rdamage_min;
        wd.status_reflect_damage_max = rdamage_max;
    }
}

/**
 * 
 * @param {PlayerData|MonsterData} target 
 * @param {PlayerData|MonsterData} src 
 * @param {number} dmg 
 * @param {number} flag 
 * @param {number} skill_id 
 * @param {boolean} status_reflect 
 */
function battle_calc_return_damage(target, src, dmg, flag, skill_id, status_reflect) {
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null
    let rdamage = 0;
    let damage = dmg;
    let reflect_flag = false;

    if(flag&BF.SHORT) {
        if(!status_reflect && tsd && tsd.bonus.short_weapon_damage_return) {
            reflect_flag = true;
            rdamage += Math.trunc((damage * tsd.bonus.short_weapon_damage_return) / 100);
        } else if(!status_reflect && target.type == BL.MOB && manualedits_get(monster, 71)) {
            reflect_flag = true;
            rdamage += Math.trunc((damage * manualedits_get(monster, 71).value) / 100);
        } else if (status_reflect) {
            if(sc_get(target, SC.SHIELDREFLECT) && skill_id != SKILL.WS_CARTTERMINATION) { // reflect shield
                reflect_flag = true;
                rdamage += Math.trunc((damage * (10 + sc_get(target, SC.SHIELDREFLECT).val2)) / 100);
            }
        }
    } else {
        if(!status_reflect && tsd && tsd.bonus.long_weapon_damage_return) {
            reflect_flag = true;
            rdamage += Math.trunc((damage * tsd.bonus.long_weapon_damage_return) / 100);
        } else if(!status_reflect && target.type == BL.MOB && manualedits_get(monster, 71)) {
            reflect_flag = true;
            rdamage += Math.trunc((damage * manualedits_get(monster, 71).value) / 100);
        }
    }

    let woe_map = c.A8_Skill14.value == 1;
    if(woe_map) {
        rdamage = battle_calc_gvg_damage(src, target, rdamage, skill_id, flag);
    }

    let reduce = 0;
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    if(sd && sd.bonus.reduce_damage_return != 0)
        reduce += sd.bonus.reduce_damage_return;

    if(rdamage > 0 || reflect_flag) {
        rdamage -= Math.trunc((rdamage * Math.min(100, reduce)) / 100);
        rdamage = Math.max(rdamage, 1);
    }

    rdamage = battle_cap_reflect_damage(src, target, rdamage);

    if(rdamage == 0)
        return 0;
    else
        return cap_value(rdamage, 1, INT64_MAX);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} damage 
 * @returns 
 */
function battle_cap_reflect_damage(src, target, damage) {
    if(damage > 0 && src && target && src.type == BL.MOB)
        damage = cap_value(damage, 1, status_get_status_data(target).max_hp);

    if(target.type == BL.PC) {
        if(target.special_state.no_reflect)
            damage = 0;
    }

    return damage;
}

/**
 * Calculates final attack modifiers for weapon-based attacks   
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_weapon_final_atk_modifiers(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_weapon_final_atk_modifiers] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    let skill_damage = 0;

    if(skill_id == SKILL.ASC_BREAKER || skill_id == SKILL.AM_DEMONSTRATION) {
        let md = battle_calc_misc_attack(src, target, skill_id, skill_lv, wd.miscflag);

        battleDebug && console.log(`[battle_calc_weapon_final_atk_modifiers] ASC_BREAKER misc portion â€” md.damage_min=${md.damage_min}, md.damage_max=${md.damage_max}`);
        wd.damage_min += md.damage_min;
        wd.damage_max += md.damage_max;

        wd.crit_damage_min += md.damage_min;
        wd.crit_damage_max += md.damage_max;

}
    battleDebug && console.log(`[battle_calc_weapon_final_atk_modifiers] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
}

/**
 * GVG attack modifiers
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_attack_gvg_bg(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_gvg_bg] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    let woe_map = c.A8_Skill14.value == 1;

    if((wd.getAverageDamage() + wd.getAverageDamage2()) || (wd.getAverageCritDamage() + wd.getAverageCritDamage2())) {
        if(!wd.getAverageDamage2() && !wd.getAverageCritDamage2()) {
            wd.damage_min = battle_calc_damage(src, target, wd, wd.damage_min, skill_id, skill_lv);
            wd.damage_max = battle_calc_damage(src, target, wd, wd.damage_max, skill_id, skill_lv);

            wd.crit_damage_min = battle_calc_damage(src, target, wd, wd.crit_damage_min, skill_id, skill_lv);
            wd.crit_damage_max = battle_calc_damage(src, target, wd, wd.crit_damage_max, skill_id, skill_lv);
            if(woe_map) {
                wd.damage_min = battle_calc_gvg_damage(src, target, wd.damage_min, skill_id, wd.flag);
                wd.damage_max = battle_calc_gvg_damage(src, target, wd.damage_max, skill_id, wd.flag);

                wd.crit_damage_min = battle_calc_gvg_damage(src, target, wd.crit_damage_min, skill_id, wd.flag);
                wd.crit_damage_max = battle_calc_gvg_damage(src, target, wd.crit_damage_max, skill_id, wd.flag);
            }
        } else if (!wd.getAverageDamage() && !wd.getAverageCritDamage()) {
            wd.damage2_min = battle_calc_damage(src, target, wd, wd.damage2_min, skill_id, skill_lv);
            wd.damage2_max = battle_calc_damage(src, target, wd, wd.damage2_max, skill_id, skill_lv);

            wd.crit_damage2_min = battle_calc_damage(src, target, wd, wd.crit_damage2_min, skill_id, skill_lv);
            wd.crit_damage2_max = battle_calc_damage(src, target, wd, wd.crit_damage2_max, skill_id, skill_lv);
            if(woe_map) {
                wd.damage2_min = battle_calc_gvg_damage(src, target, wd.damage2_min, skill_id, wd.flag);
                wd.damage2_max = battle_calc_gvg_damage(src, target, wd.damage2_max, skill_id, wd.flag);

                wd.crit_damage2_min = battle_calc_gvg_damage(src, target, wd.crit_damage2_min, skill_id, wd.flag);
                wd.crit_damage2_max = battle_calc_gvg_damage(src, target, wd.crit_damage2_max, skill_id, wd.flag);
            }
        } else {
            wd.damage_min = battle_calc_damage(src, target, wd, wd.damage_min, skill_id, skill_lv);
            wd.damage_max = battle_calc_damage(src, target, wd, wd.damage_max, skill_id, skill_lv);
            wd.damage2_min = battle_calc_damage(src, target, wd, wd.damage2_min, skill_id, skill_lv);
            wd.damage2_max = battle_calc_damage(src, target, wd, wd.damage2_max, skill_id, skill_lv);

            wd.crit_damage_min = battle_calc_damage(src, target, wd, wd.crit_damage_min, skill_id, skill_lv);
            wd.crit_damage_max = battle_calc_damage(src, target, wd, wd.crit_damage_max, skill_id, skill_lv);
            wd.crit_damage2_min = battle_calc_damage(src, target, wd, wd.crit_damage2_min, skill_id, skill_lv);
            wd.crit_damage2_max = battle_calc_damage(src, target, wd, wd.crit_damage2_max, skill_id, skill_lv);
            if(woe_map) {
                wd.damage_min = battle_calc_gvg_damage(src, target, wd.damage_min, skill_id, wd.flag);
                wd.damage_max = battle_calc_gvg_damage(src, target, wd.damage_max, skill_id, wd.flag);
                wd.damage2_min = battle_calc_gvg_damage(src, target, wd.damage2_min, skill_id, wd.flag);
                wd.damage2_max = battle_calc_gvg_damage(src, target, wd.damage2_max, skill_id, wd.flag);

                wd.crit_damage_min = battle_calc_gvg_damage(src, target, wd.crit_damage_min, skill_id, wd.flag);
                wd.crit_damage_max = battle_calc_gvg_damage(src, target, wd.crit_damage_max, skill_id, wd.flag);
                wd.crit_damage2_min = battle_calc_gvg_damage(src, target, wd.crit_damage2_min, skill_id, wd.flag);
                wd.crit_damage2_max = battle_calc_gvg_damage(src, target, wd.crit_damage2_max, skill_id, wd.flag);
            }
            if(wd.getAverageDamage() > 1 && wd.getAverageDamage2() < 1)
                wd.damage2_min = wd.damage2_max = 1;
            if(wd.getAverageCritDamage() > 1 && wd.getAverageCritDamage2() < 1)
                wd.crit_damage2_min = wd.crit_damage2_max = 1;
        }
    }
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {Damage} wd 
 * @param {number} damage 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function battle_calc_damage(src, target, wd, damage, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_damage] START â€” damage=${damage}, skill_id=${skill_id}`);
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null
    let tstatus = status_get_status_data(target);
    let div_ = wd.div_;
    let flag = wd.flag;

    if(!damage)
        return 0;

    if(tsd) {
        if(flag&BF.WEAPON && tsd.special_state.no_weapon_damage) {
            battleDebug && console.log(`[battle_calc_damage] tsd no_weapon_damage=${tsd.special_state.no_weapon_damage}`);
            damage -= Math.trunc(damage * tsd.special_state.no_weapon_damage / 100);
        }
        if(flag&BF.MAGIC && tsd.special_state.no_magic_damage) {
            battleDebug && console.log(`[battle_calc_damage] tsd no_magic_damage=${tsd.special_state.no_magic_damage}`);
            damage -= Math.trunc(damage * tsd.special_state.no_magic_damage / 100);
        }
        if(flag&BF.MISC && tsd.special_state.no_misc_damage) {
            battleDebug && console.log(`[battle_calc_damage] tsd no_misc_damage=${tsd.special_state.no_misc_damage}`);
            damage -= Math.trunc(damage * tsd.special_state.no_misc_damage / 100);
        }

        if(!damage)
            return 0;
    }
    battleDebug && console.log(`[battle_calc_damage] after tsd special_state â€” damage=${damage}`);

    switch(skill_id) {
        case SKILL.PA_PRESSURE:
        case SKILL.HW_GRAVITATION:
            return damage;
    }

    // src is player, target is mob or custom player
    if(sd) {
        battleDebug && console.log(`[battle_calc_damage] entering SD block â€” damage=${damage}, flag=${flag}`);
        if(sc_get(target, SC.AETERNA)) // lex aeterna
            damage *= 2;
        battleDebug && console.log(`[battle_calc_damage] after lex aeterna check â€” damage=${damage}`);

        // assumptio
        if(sc_get(target, SC.ASSUMPTIO)) {
            if(c.A8_Skill14.value == 1) // woe map
                damage = Math.trunc(damage * 2 / 3);
            else
                damage = Math.trunc(damage / 2);
        }
        battleDebug && console.log(`[battle_calc_damage] after assumptio â€” damage=${damage}`);

        // defender on mobs works differently
        if(sc_get(target, SC.ARMOR) && flag&BF.LONG && flag&(BF.WEAPON|BF.MISC))
            damage = Math.trunc(damage / 8);
        battleDebug && console.log(`[battle_calc_damage] after defender â€” damage=${damage}`);

        // stone skin & anti magic
        if(sc_get(target, SC.ARMORCHANGE)) {
            if(flag&BF.WEAPON)
                damage -= Math.trunc(damage * sc_get(target, SC.ARMORCHANGE).val2 / 100);
            else if(flag&BF.MAGIC)
                damage -= Math.trunc(damage * sc_get(target, SC.ARMORCHANGE).val3 / 100);
        }

        // energy coat
        if(sc_get(target, SC.ENERGYCOAT) && (flag&BF.WEAPON && skill_id != SKILL.WS_CARTTERMINATION)) {
            damage -= Math.trunc((damage * 6 * sc_get(target, SC.ENERGYCOAT).val1) / 100);
        }
        battleDebug && console.log(`[battle_calc_damage] after energy coat â€” damage=${damage}`);

        if(!damage)
            return 0;

        // damage decrease from notes
        if(monster.damagetaken > 0) {
            battleDebug && console.log(`[battle_calc_damage] monster.damagetaken=${monster.damagetaken}`);
            damage = Math.trunc((damage * monster.damagetaken) / 100);
            battleDebug && console.log(`[battle_calc_damage] after damagetaken â€” damage=${damage}`);
        }
        battleDebug && console.log(`[battle_calc_damage] END of SD block â€” damage=${damage}`);
    }
    
    // target is player, source is mob or custom player
    if(tsd) {
        battleDebug && console.log(`[battle_calc_damage] entering TSD block â€” damage=${damage}`);
        if(sc_get(target, SC.AETERNA)) // lex aeterna
            damage *= 2;

        // assumptio
        if(sc_get(target, SC.ASSUMPTIO)) {
            if(c.A8_Skill14.value == 1) // woe map
                damage = Math.trunc(damage * 2 / 3);
            else
                damage = Math.trunc(damage / 2);
        }

        // defender on players
        if(sc_get(src, SC.DEFENDER) && skill_id != SKILL.NJ_ZENYNAGE && ((flag&(BF.LONG|BF.WEAPON)) == (BF.LONG|BF.WEAPON) || skill_id == SKILL.LK_SPIRALPIERCE)) {
            damage -= Math.trunc(damage * (5 + sc_get(src, SC.DEFENDER).val2) / 100);
        }

        if(SkillSearch(SKILL.GS_ADJUSTMENT) && (flag&(BF.LONG|BF.WEAPON)) == (BF.LONG|BF.WEAPON))
            damage -= Math.trunc((damage * 20) / 100);

        // wall of fog
        if(sc_get(src, SC.FOGWALL)) {
            if(flag&BF.SKILL)
                damage -= Math.trunc((damage * 25) / 100);
            else if((flag&(BF.LONG|BF.WEAPON)) == (BF.LONG|BF.WEAPON))
                damage = Math.trunc(damage / 4);
        }

        if(SkillSearch(SKILL.MG_ENERGYCOAT) && (flag&BF.WEAPON && skill_id != SKILL.WS_CARTTERMINATION)) {
            damage -= Math.trunc((damage * 6 * SkillSearch(SKILL.MG_ENERGYCOAT)) / 100);
        }

        if(!damage)
            return 0;

        battleDebug && console.log(`[battle_calc_damage] END of TSD block â€” damage=${damage}`);
    }


    switch(skill_id) {
        case 0:
            if(sd) {
                battleDebug && console.log(`[battle_calc_damage] skill_id=0 normalatk_dmgrate=${sd.bonus.normalatk_dmgrate}`);
                damage += Math.trunc((damage * sd.bonus.normalatk_dmgrate) / 100);
                battleDebug && console.log(`[battle_calc_damage] after normalatk_dmgrate â€” damage=${damage}`);
            }
    }

    battleDebug && console.log(`[battle_calc_damage] END â€” damage=${damage}`);
    return damage;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_attack_left_right_hands(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_left_right_hands] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null

    if(sd) {
        let skill;

        if(sd.status.weapon == WEAPON.KATAR && !skill_id) {
            skill = SkillSearch(SKILL.TF_DOUBLE);
            wd.damage2_min = wd.damage_min * Math.trunc((1 + (skill * 2)) / 100);
            wd.damage2_max = wd.damage_max * Math.trunc((1 + (skill * 2)) / 100);
            wd.crit_damage2_min = wd.crit_damage_min * Math.trunc((1 + (skill * 2)) / 100);
            wd.crit_damage2_max = wd.crit_damage_max * Math.trunc((1 + (skill * 2)) / 100);
        } else if (is_attack_left_handed(src, skill_id)) {
            if(is_attack_right_handed(src, skill_id) && (wd.getAverageDamage() || wd.getAverageCritDamage())) {
                if(n_A_JobClass() == JOB.THIEF) {
                    skill = SkillSearch(SKILL.AS_RIGHT);
                    wd.damage_min = ATK_RATER(wd.damage_min, 50 + (skill * 10));
                    wd.damage_max = ATK_RATER(wd.damage_max, 50 + (skill * 10));
                    wd.crit_damage_min = ATK_RATER(wd.crit_damage_min, 50 + (skill * 10));
                    wd.crit_damage_max = ATK_RATER(wd.crit_damage_max, 50 + (skill * 10));
                }
                if(wd.getAverageDamage() < 1)
                    wd.damage_min = wd.damage_max = 1;
                if(wd.getAverageCritDamage() < 1) 
                    wd.crit_damage_min = wd.crit_damage_max = 1;
            }
            if(wd.getAverageDamage2() || wd.getAverageCritDamage2()) {
                if(n_A_JobClass() == JOB.THIEF) {
                    skill = SkillSearch(SKILL.AS_LEFT);
                    wd.damage2_min = ATK_RATER(wd.damage2_min, 30 + (skill * 10));
                    wd.damage2_max = ATK_RATER(wd.damage2_max, 30 + (skill * 10));
                    wd.crit_damage2_min = ATK_RATER(wd.crit_damage2_min, 30 + (skill * 10));
                    wd.crit_damage2_max = ATK_RATER(wd.crit_damage2_max, 30 + (skill * 10));
                }
                if(wd.getAverageDamage2() < 1)
                    wd.damage2_min = wd.damage2_max = 1;
                if(wd.getAverageCritDamage2() < 1)
                    wd.crit_damage2_min = wd.crit_damage2_max = 1;
            }
        }
    }

    if(!is_attack_right_handed(src, skill_id) && !is_attack_left_handed(src, skill_id) && wd.getAverageDamage()) {
        wd.damage_min = wd.damage_max = 0;
        wd.crit_damage_min = wd.crit_damage_max = 0;
    }
    if(!is_attack_left_handed(src, skill_id) && wd.getAverageDamage2()) {
        wd.damage2_min = wd.damage2_max = 0;
        wd.crit_damage2_min = wd.crit_damage2_max = 0;
    }
    battleDebug && console.log(`[battle_calc_attack_left_right_hands] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function battle_calc_attack_plant(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_plant] START â€” skill_id=${skill_id}`);
    let tstatus = status_get_status_data(target);
    let attack_hits = is_attack_hitting(wd, src, target, skill_id, skill_lv, false);

    if(attack_hits || wd.getAverageDamage() > 0 || wd.getAverageCritDamage() > 0) {
        wd.damage_min = wd.damage_max = 1;
        wd.crit_damage_min = wd.crit_damage_max = 1;
    }
    if(is_attack_left_handed(src, skill_id) && (attack_hits || wd.getAverageDamage2() > 0 || wd.getAverageCritDamage2() > 0)) { 
        let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null

        if(sd && sd.status.weapon == WEAPON.KATAR) {
            wd.damage2_min = wd.damage2_max = 0;
            wd.crit_damage2_min = wd.crit_damage2_max = 0;
        } else {
            wd.damage2_min = wd.damage2_max = 1;
            wd.crit_damage2_min = wd.crit_damage2_max = 1;
        }
    }

    if(attack_hits && target.type == BL.MOB && target.mob_id == 44) { // emperium
        if(flag&BF.SKILL) {
            wd.damage_min = wd.damage_max = wd.damage2_min = wd.damage2_max = 0;
            wd.crit_damage_min = wd.crit_damage_max = wd.crit_damage2_min = wd.crit_damage2_max = 0;
            return; 
        }

        const right_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_R);
        const left_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_L);

        if(wd.getAverageDamage() > 0 || wd.getAverageCritDamage() > 0) {
            wd.damage_min = battle_attr_fix(src, target, wd.damage_min, right_element, target.def_ele, target.ele_lv);
            wd.damage_max = battle_attr_fix(src, target, wd.damage_max, right_element, target.def_ele, target.ele_lv);
            wd.damage_min = battle_calc_gvg_damage(src, target, wd.damage_min, skill_id, wd.flag);
            wd.damage_max = battle_calc_gvg_damage(src, target, wd.damage_max, skill_id, wd.flag);

            wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, right_element, target.def_ele, target.ele_lv);
            wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, right_element, target.def_ele, target.ele_lv);
            wd.crit_damage_min = battle_calc_gvg_damage(src, target, wd.crit_damage_min, skill_id, wd.flag);
            wd.crit_damage_max = battle_calc_gvg_damage(src, target, wd.crit_damage_max, skill_id, wd.flag);
        } else if (wd.getAverageDamage2() > 0 || wd.getAverageCritDamage2() > 0) {
            wd.damage2_min = battle_attr_fix(src, target, wd.damage2_min, left_element, target.def_ele, target.ele_lv);
            wd.damage2_max = battle_attr_fix(src, target, wd.damage2_max, left_element, target.def_ele, target.ele_lv);
            wd.damage2_min = battle_calc_gvg_damage(src, target, wd.damage2_min, skill_id, wd.flag);
            wd.damage2_max = battle_calc_gvg_damage(src, target, wd.damage2_max, skill_id, wd.flag);

            wd.crit_damage2_min = battle_attr_fix(src, target, wd.crit_damage2_min, left_element, target.def_ele, target.ele_lv);
            wd.crit_damage2_max = battle_attr_fix(src, target, wd.crit_damage2_max, left_element, target.def_ele, target.ele_lv);
            wd.crit_damage2_min = battle_calc_gvg_damage(src, target, wd.crit_damage2_min, skill_id, wd.flag);
            wd.crit_damage2_max = battle_calc_gvg_damage(src, target, wd.crit_damage2_max, skill_id, wd.flag);
        }
        return;
    }

    if((skill_id == SKILL.MO_TRIPLEATTACK || skill_id == SKILL.MO_FINGEROFFENSIVE) && wd.div_ < 0 && tstatus.def == 100)
        wd.div_ *= -1;

    battle_apply_div_fix(wd, skill_id);

    if(wd.getAverageDamage() > 1 && wd.getAverageDamage2() > 0) {
        wd.damage_min = wd.damage_max = wd.damage2_min = wd.damage2_max = 1;
        wd.crit_damage_min = wd.crit_damage_max = wd.crit_damage2_min = wd.crit_damage2_max = 1;
    }
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} damage 
 * @param {number} skill_id 
 * @param {number} flag 
 * @returns 
 */
function battle_calc_gvg_damage(src, target, damage, skill_id, flag) {
    if(!damage)
        return 0;

    if(skill_ignores_gvgreduction(skill_id))
        return damage;

    if(flag & BF.SKILL) {
        if(flag & BF.WEAPON)
            damage = Math.trunc(damage * 60 / 100);
        if (flag & BF.MAGIC)
            damage = Math.trunc(damage * 60 / 100);
        if (flag & BF.MISC)
            damage = Math.trunc(damage * 60 / 100);
    } else {
        if(flag & BF.SHORT)
            damage = Math.trunc(damage * 80 / 100);
        if(flag & BF.LONG)
            damage = Math.trunc(damage * 80 / 100);
    }
    damage = damage > 1 ? damage : 1;
    return damage;
}

/**
 * 
 * @param {Damage} wd 
 * @param {number} skill_id 
 */
function battle_apply_div_fix(wd, skill_id) {
    battleDebug && console.log(`[battle_apply_div_fix] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, div_=${wd.div_}`);
    if(wd.getAverageDamage() > 0 || wd.getAverageCritDamage() > 0) {
        wd.damage_min = DAMAGE_DIV_FIX(wd.damage_min, wd.div_);
        wd.damage_max = DAMAGE_DIV_FIX(wd.damage_max, wd.div_);
        wd.crit_damage_min = DAMAGE_DIV_FIX(wd.crit_damage_min, wd.div_);
        wd.crit_damage_max = DAMAGE_DIV_FIX(wd.crit_damage_max, wd.div_);
    } else if (wd.div_ < 0) {
        wd.div_ *= -1;
    }
    battleDebug && console.log(`[battle_apply_div_fix] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, div_=${wd.div_}`);
}

/**
 * 
 * @param {BF} attack_type 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {ELE} rh_ele 
 * @param {ELE} lh_ele 
 * @param {number} damage 
 * @param {number} left 
 * @param {number} flag 
 * @returns 
 */
function battle_calc_cardfix(attack_type, src, target, skill_id, rh_ele, lh_ele, damage, left, flag) {
    battleDebug && console.log(`[battle_calc_cardfix] START â€” attack_type=${attack_type}, damage=${damage}, left=${left}, rh_ele=${rh_ele}, lh_ele=${lh_ele}`);
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    let tsd = is_player_object(target) ? target : null; // get player data if target is player, otherwise null
    let md = is_monster_object(src) ? src : null; // get monster data if src is monster, otherwise null
    let dstmd = is_monster_object(target) ? target : null; // get monster data if target is monster, otherwise null
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let cardfix = 1000;
    let s_class, t_class;
    let s_race2, t_race2;
    let s_defele;
    let original_damage;
    battleDebug && console.log(`[battle_calc_cardfix] after variable initialization â€” damage=${damage}, sd=${sd ? "exists" : "null"}, tsd=${tsd ? "exists" : "null"}`);

    if(!damage)
        return 0;

    original_damage = damage;

    t_class = status_get_class(target);
    s_class = status_get_class(src);

    s_race2 = status_get_race2(src);
    t_race2 = status_get_race2(target);
    s_defele = tsd ? status_get_element(src) : ELE.NONE;

    if(src && src.type == BL.MOB) {
        flag |= BF.WEAPON;
        flag &= ~BF.MAGIC;
    }
    
    switch(attack_type) {
        case BF.MAGIC:
            if(sd && !skill_ignores_atkcard(skill_id)) {
                let race2_val = 0;

                for(const raceit of t_race2) {
                    race2_val += sd.indexed_bonus.magic_addrace2[raceit];
                }
                cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.magic_addrace[tstatus.race] + sd.indexed_bonus.magic_addrace[RC.ALL] + race2_val)) / 100);
                if(!skill_ignores_element(skill_id)) {
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.magic_addele[tstatus.def_ele] + sd.indexed_bonus.magic_addele[ELE.MAX] +
                        sd.indexed_bonus.magic_addele_script[tstatus.def_ele] + sd.indexed_bonus.magic_addele_script[ELE.MAX])) / 100);
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.magic_atk_ele[rh_ele] + sd.indexed_bonus.magic_atk_ele[ELE.MAX])) / 100);
                }
                cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.magic_addsize[tstatus.size] + sd.indexed_bonus.magic_addsize[SZ.ALL])) / 100);
                cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.magic_addclass[tstatus.class_] + sd.indexed_bonus.magic_addclass[CLASS.ALL])) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
                battleDebug && console.log(`[battle_calc_cardfix] after sd atkcard and element bonuses â€” damage=${damage}, cardfix=${cardfix}`);
            }

            if(tsd && !skill_ignores_defcard(skill_id)) {
                cardfix = 1000;

                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = tsd.indexed_bonus.subele[rh_ele] + tsd.indexed_bonus.subele[ELE.MAX] + tsd.indexed_bonus.subele_script[rh_ele] + tsd.indexed_bonus.subele_script[ELE.MAX];
                    
                    for(const it of tsd.subele2) {
                        if(it.ele != ELE.MAX && it.ele != rh_ele) 
                            continue;
                        if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                            ((it.flag)&flag)&BF.RANGEMASK &&
                            ((it.flag)&flag)&BF.SKILLMASK))
                            continue;
                        ele_fix += it.rate;
                    }

                    if(s_defele != ELE.NONE)
                        ele_fix += tsd.indexed_bonus.magic_subdefele[s_defele] + tsd.indexed_bonus.magic_subdefele[ELE.MAX];

                    cardfix = Math.trunc((cardfix * (100 - ele_fix)) / 100);
                }
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subsize[sstatus.size] - tsd.indexed_bonus.subsize[SZ.ALL])) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.magic_subsize[sstatus.size] - tsd.indexed_bonus.magic_subsize[SZ.ALL])) / 100);

                let race_fix = 0;

                for(const raceit of s_race2) {
                    race_fix += tsd.indexed_bonus.subrace2[raceit];
                }

                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                race_fix = tsd.indexed_bonus.subrace[sstatus.race] + tsd.indexed_bonus.subrace[RC.ALL];
                for(const it of tsd.subrace3) {
                    if(it.race != RC.ALL && it.race != sstatus.race) 
                        continue;
                    if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                        ((it.flag)&flag)&BF.RANGEMASK &&
                        ((it.flag)&flag)&BF.SKILLMASK))
                        continue;
                    race_fix += it.rate;
                }
                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subclass[sstatus.class_] - tsd.indexed_bonus.subclass[CLASS.ALL])) / 100);

                if(flag&BF.SHORT) { 
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.near_attack_def_rate)) / 100);
                } else if(!skill_ignores_longcard(skill_id)) {
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.long_attack_def_rate)) / 100);
                }

                if(sc_get(target, SC.MDEF_RATE))
                    cardfix = Math.trunc((cardfix * (100 - sc_get(target, SC.MDEF_RATE).val1)) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
            }

            if(src.type == BL.MOB && !skill_ignores_atkcard(skill_id)) {
                cardfix = 1000;

                if(manualedits_get(monster, 354))
                    cardfix = Math.trunc((cardfix * (100 + manualedits_get(monster, 354).value)) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
            } 

            if(target.type == BL.MOB && !skill_ignores_defcard(skill_id)) {
                cardfix = 1000;

                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = 0;
                    if(manualedits_get(monster, 6000 + rh_ele))
                        ele_fix += manualedits_get(monster, 6000 + rh_ele).value;
                    if(manualedits_get(monster, 6010 + rh_ele))
                        ele_fix += manualedits_get(monster, 6010 + rh_ele).value;

                    if(ele_fix)
                        cardfix = Math.trunc((cardfix * (100 - ele_fix)) / 100);
                }

                let racefix = 0;
                if(manualedits_get(monster, 604))
                    racefix += manualedits_get(monster, 604).value;
                cardfix = Math.trunc((cardfix * (100 - racefix)) / 100);

                let sizefix = 0;
                if(manualedits_get(monster, 602))
                    sizefix += manualedits_get(monster, 602).value;
                cardfix = Math.trunc((cardfix * (100 - sizefix)) / 100);

                let longrangefix = 0;
                if(manualedits_get(monster, 78))
                    longrangefix += manualedits_get(monster, 78).value;

                if(longrangefix && !skill_ignores_longcard(skill_id) && !(flag&BF.SHORT))
                    cardfix = Math.trunc((cardfix * (100 - longrangefix)) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
            }
            break;

        case BF.WEAPON:
            battleDebug && console.log(`[battle_calc_cardfix] BF.WEAPON branch â€” sd=${!!sd}, tsd=${!!tsd}, left=${left}, skill_ignores_atkcard=${skill_ignores_atkcard(skill_id)}, skill_ignores_defcard=${skill_ignores_defcard(skill_id)}`);
            if(sd && !skill_ignores_atkcard(skill_id) && (left&2)) {
                battleDebug && console.log(`[battle_calc_cardfix] Entering ATTACKER card bonuses â€” is_skill_using_arrow=${is_skill_using_arrow(src, skill_id)}`);
                if(is_skill_using_arrow(src, skill_id)) {
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addrace[tstatus.race] + sd.indexed_bonus.addrace[RC.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] ARROW after race â€” cardfix=${cardfix}`);

                    if(!skill_ignores_element(skill_id)) {
                        let ele_fix = sd.indexed_bonus.addele[tstatus.def_ele] + sd.indexed_bonus.addele[ELE.MAX];
                        battleDebug && console.log(`[battle_calc_cardfix] ARROW â€” addele[${tstatus.def_ele}]=${sd.indexed_bonus.addele[tstatus.def_ele]}, addele[ALL]=${sd.indexed_bonus.addele[ELE.MAX]}, ele_fix=${ele_fix}`);

                        for(const it of sd.addele2) {
                            if(it.ele != ELE.MAX && it.ele != tstatus.def_ele)
                                continue;
                            if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                                ((it.flag)&flag)&BF.RANGEMASK &&
                                ((it.flag)&flag)&BF.SKILLMASK))
                                continue;
                            ele_fix += it.rate;
                        }

                        cardfix = Math.trunc((cardfix * (100 + ele_fix)) / 100);
                        battleDebug && console.log(`[battle_calc_cardfix] ARROW after ele â€” cardfix=${cardfix}`);
                    }

                    battleDebug && console.log(`[battle_calc_cardfix] ARROW â€” addsize[${tstatus.size}]=${sd.indexed_bonus.addsize[tstatus.size]}, addsize[ALL]=${sd.indexed_bonus.addsize[SZ.ALL]}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addsize[tstatus.size] + sd.indexed_bonus.addsize[SZ.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] ARROW after size â€” cardfix=${cardfix}`);

                    let race_fix = 0;
                    for(const raceit of t_race2) {
                        race_fix += sd.indexed_bonus.addrace2[raceit];
                    }
                    cardfix = Math.trunc((cardfix * (100 + race_fix)) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] ARROW after race2 â€” race_fix=${race_fix}, cardfix=${cardfix}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addclass[tstatus.class_] + sd.indexed_bonus.addclass[CLASS.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] ARROW after class â€” addclass[${tstatus.class_}]=${sd.indexed_bonus.addclass[tstatus.class_]}, addclass[ALL]=${sd.indexed_bonus.addclass[CLASS.ALL]}, cardfix=${cardfix}`);
                } else {
                    let skill = 0;

                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addrace[tstatus.race] + sd.indexed_bonus.addrace[RC.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after race â€” cardfix=${cardfix}`);
                    if(!skill_ignores_element(skill_id)) {
                        let ele_fix = sd.indexed_bonus.addele[tstatus.def_ele] + sd.indexed_bonus.addele[ELE.MAX];
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE â€” addele[${tstatus.def_ele}]=${sd.indexed_bonus.addele[tstatus.def_ele]}, addele[ALL]=${sd.indexed_bonus.addele[ELE.MAX]}, ele_fix=${ele_fix}`);

                        for(const it of sd.addele2) {
                            if(it.ele != ELE.MAX && it.ele != tstatus.def_ele)
                                continue;
                            if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                                ((it.flag)&flag)&BF.RANGEMASK &&
                                ((it.flag)&flag)&BF.SKILLMASK))
                                continue;
                            ele_fix += it.rate;
                        }
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE after addele2 loop â€” ele_fix=${ele_fix}`);

                        cardfix = Math.trunc((cardfix * (100 + ele_fix)) / 100);
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE after ele â€” cardfix=${cardfix}`);
                    }
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE â€” addsize[${tstatus.size}]=${sd.indexed_bonus.addsize[tstatus.size]}, addsize[ALL]=${sd.indexed_bonus.addsize[SZ.ALL]}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addsize[tstatus.size] + sd.indexed_bonus.addsize[SZ.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after size â€” cardfix=${cardfix}`);

                    for(const raceit of t_race2) {
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE race2 loop â€” raceit=${raceit}, addrace2[raceit]=${sd.indexed_bonus.addrace2[raceit]}`);
                        cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addrace2[raceit])) / 100);
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE after race2 iter â€” cardfix=${cardfix}`);
                    }
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE â€” addclass[${tstatus.class_}]=${sd.indexed_bonus.addclass[tstatus.class_]}, addclass[ALL]=${sd.indexed_bonus.addclass[CLASS.ALL]}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.indexed_bonus.addclass[tstatus.class_] + sd.indexed_bonus.addclass[CLASS.ALL])) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after class - class bonus=${Math.trunc((100 + sd.indexed_bonus.addclass[tstatus.class_] + sd.indexed_bonus.addclass[CLASS.ALL]) / 100)}`);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after class â€” cardfix=${cardfix}`);

                    if(player.weapontype1 == WEAPON.KATAR && (skill = SkillSearch(SKILL.ASC_KATAR)) > 0) {
                        cardfix = Math.trunc((cardfix * (100 + (10 + 2 * skill))) / 100);
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE after katar â€” cardfix=${cardfix}`);
                    }
                }

                for(const it of sd.add_dmg) {
                    if(it.id == t_class) {
                        cardfix = Math.trunc((cardfix * (100 + it.val)) / 100);
                        battleDebug && console.log(`[battle_calc_cardfix] MELEE after add_dmg â€” id=${it.id}, val=${it.val}, cardfix=${cardfix}`);
                        break;
                    }
                }

                for(const it of sd.addstatus_dmg) {
                    if(sc_get(target, eff_to_sc(it.id))) {
                        cardfix = Math.trunc((cardfix * (100 + it.val)) / 100);
                    }
                }

                if(flag & BF.SHORT) {
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE â€” short_attack_atk_rate=${sd.bonus.short_attack_atk_rate}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.bonus.short_attack_atk_rate)) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after short â€” cardfix=${cardfix}`);
                }
                if(flag & BF.LONG) {
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE â€” long_attack_atk_rate=${sd.bonus.long_attack_atk_rate}`);
                    cardfix = Math.trunc((cardfix * (100 + sd.bonus.long_attack_atk_rate)) / 100);
                    battleDebug && console.log(`[battle_calc_cardfix] MELEE after long â€” cardfix=${cardfix}`);
                }

                battleDebug && console.log(`[battle_calc_cardfix] MELEE before APPLY_CARDFIX â€” damage=${damage}, cardfix=${cardfix}`);
                damage = APPLY_CARDFIX(damage, cardfix);
                battleDebug && console.log(`[battle_calc_cardfix] MELEE after APPLY_CARDFIX â€” damage=${damage}`);
            } else if(tsd && !skill_ignores_defcard(skill_id) && !(left&2)) {
                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = tsd.indexed_bonus.subele[rh_ele] + tsd.indexed_bonus.subele[ELE.MAX] + tsd.indexed_bonus.subele_script[rh_ele] + tsd.indexed_bonus.subele_script[ELE.MAX];

                    for(const it of tsd.subele2) {
                        if(it.ele != ELE.MAX && it.ele != rh_ele) 
                            continue;
                        if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                            ((it.flag)&flag)&BF.RANGEMASK &&
                            ((it.flag)&flag)&BF.SKILLMASK))
                            continue;
                        ele_fix += it.rate;
                    }

                    cardfix = Math.trunc((cardfix * (100 - ele_fix)) / 100);

                    if(left&1 && lh_ele != rh_ele) {
                        let ele_fix_lh = tsd.indexed_bonus.subele[lh_ele] + tsd.indexed_bonus.subele[ELE.MAX] + tsd.indexed_bonus.subele_script[lh_ele] + tsd.indexed_bonus.subele_script[ELE.MAX];

                        for(const it of tsd.subele2) {
                            if(it.ele != ELE.MAX && it.ele != lh_ele) 
                                continue;
                            if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                                ((it.flag)&flag)&BF.RANGEMASK &&
                                ((it.flag)&flag)&BF.SKILLMASK))
                                continue;
                            ele_fix_lh += it.rate;
                        }
                        cardfix = Math.trunc((cardfix * (100 - ele_fix_lh)) / 100);
                    }

                    cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subdefele[sstatus.def_ele] - tsd.indexed_bonus.subdefele[ELE.MAX])) / 100);
                }

                let race_fix = 0;

                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subsize[sstatus.size] - tsd.indexed_bonus.subsize[SZ.ALL])) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.weapon_subsize[sstatus.size] - tsd.indexed_bonus.weapon_subsize[SZ.ALL])) / 100);

                for(const raceit of s_race2) {
                    race_fix += tsd.indexed_bonus.subrace2[raceit];
                }
                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                race_fix = tsd.indexed_bonus.subrace[sstatus.race] + tsd.indexed_bonus.subrace[RC.ALL];
                for(const it of tsd.subrace3) {
                    if(it.race != RC.ALL && it.race != sstatus.race)
                        continue;
                    if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                        ((it.flag)&flag)&BF.RANGEMASK &&
                        ((it.flag)&flag)&BF.SKILLMASK))
                        continue;
                    race_fix += it.rate;
                }
                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subclass[sstatus.class_] - tsd.indexed_bonus.subclass[CLASS.ALL])) / 100);
                if(flag&BF.SHORT)
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.near_attack_def_rate)) / 100);
                else if(!skill_ignores_longcard(skill_id) && !(sd && SkillSearch(SKILL.GS_WEAPON_MASTERY) == 2 && skill_id == SKILL.RL_MASS_SPIRAL))
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.long_attack_def_rate)) / 100);
                if(sc_get(target, SC.DEF_RATE))
                    cardfix = Math.trunc((cardfix * (100 - sc_get(target, SC.DEF_RATE).val1)) / 100);
                damage = APPLY_CARDFIX(damage, cardfix);
            }

            if(src.type == BL.MOB && !skill_ignores_atkcard(skill_id)) {
                cardfix = 1000;

                if(manualedits_get(monster, 80))
                    cardfix = Math.trunc((cardfix * (100 + manualedits_get(monster, 80).value)) / 100);
                damage = APPLY_CARDFIX(damage, cardfix);
            }

            if(target.type == BL.MOB && !skill_ignores_defcard(skill_id)) {
                cardfix = 1000;

                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = 0;
                    if(manualedits_get(monster, 6000 + rh_ele))
                        ele_fix += manualedits_get(monster, 6000 + rh_ele).value;
                    if(manualedits_get(monster, 6010 + rh_ele))
                        ele_fix += manualedits_get(monster, 6010 + rh_ele).value;

                    if(ele_fix)
                        cardfix = Math.trunc((cardfix * (100 - ele_fix)) / 100);
                }

                let racefix = 0;
                if(manualedits_get(monster, 604))
                    racefix += manualedits_get(monster, 604).value;
                cardfix = Math.trunc((cardfix * (100 - racefix)) / 100);

                let sizefix = 0;
                if(manualedits_get(monster, 602))
                    sizefix += manualedits_get(monster, 602).value;
                cardfix = Math.trunc((cardfix * (100 - sizefix)) / 100);

                let longrangefix = 0;
                if(manualedits_get(monster, 78))
                    longrangefix += manualedits_get(monster, 78).value;

                if(longrangefix && !skill_ignores_longcard(skill_id) && (flag&BF.LONG))
                    cardfix = Math.trunc((cardfix * (100 - longrangefix)) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
            }
            break;
        
        case BF.MISC:
            if(tsd && !skill_ignores_defcard(skill_id)) {
                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = tsd.indexed_bonus.subele[rh_ele] + tsd.indexed_bonus.subele[ELE.MAX] + tsd.indexed_bonus.subele_script[rh_ele] + tsd.indexed_bonus.subele_script[ELE.MAX];

                    for(const it of tsd.subele2) {
                        if(it.ele != ELE.MAX && it.ele != rh_ele) 
                            continue;
                        if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                            ((it.flag)&flag)&BF.RANGEMASK &&
                            ((it.flag)&flag)&BF.SKILLMASK))
                            continue;
                        ele_fix += it.rate;
                    }
                    if(s_defele != ELE.NONE)
                        ele_fix += tsd.indexed_bonus.subdefele[s_defele] + tsd.indexed_bonus.subdefele[ELE.MAX];

                    cardfix = Math.trunc(cardfix * (100 - ele_fix) / 100);
                }

                let race_fix = tsd.indexed_bonus.subrace[sstatus.race] + tsd.indexed_bonus.subrace[RC.ALL];
                for(const it of tsd.subrace3) {
                    if(it.race != RC.ALL && it.race != sstatus.race)
                        continue;
                    if(!(((it.flag)&flag)&BF.WEAPONMASK &&
                        ((it.flag)&flag)&BF.RANGEMASK &&
                        ((it.flag)&flag)&BF.SKILLMASK))
                        continue;
                    race_fix += it.rate;
                }
                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subsize[sstatus.size] - tsd.indexed_bonus.subsize[SZ.ALL])) / 100);
                race_fix = 0;
                for(const raceit of s_race2) {
                    race_fix += tsd.indexed_bonus.subrace2[raceit];
                }
                cardfix = Math.trunc((cardfix * (100 - race_fix)) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.indexed_bonus.subclass[sstatus.class_] - tsd.indexed_bonus.subclass[CLASS.ALL])) / 100);
                cardfix = Math.trunc((cardfix * (100 - tsd.bonus.misc_def_rate)) / 100);
                if(flag&BF.SHORT)
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.near_attack_def_rate)) / 100);
                else if(!skill_ignores_longcard(skill_id))
                    cardfix = Math.trunc((cardfix * (100 - tsd.bonus.long_attack_def_rate)) / 100);
                damage = APPLY_CARDFIX(damage, cardfix);
            }

            if(target.type == BL.MOB && !skill_ignores_defcard(skill_id)) {
                cardfix = 1000;

                if(!skill_ignores_element(skill_id)) {
                    let ele_fix = 0;
                    if(manualedits_get(monster, 6000 + rh_ele))
                        ele_fix += manualedits_get(monster, 6000 + rh_ele).value;
                    if(manualedits_get(monster, 6010 + rh_ele))
                        ele_fix += manualedits_get(monster, 6010 + rh_ele).value;

                    if(ele_fix)
                        cardfix = Math.trunc((cardfix * (100 - ele_fix)) / 100);
                }

                let racefix = 0;
                if(manualedits_get(monster, 604))
                    racefix += manualedits_get(monster, 604).value;
                cardfix = Math.trunc((cardfix * (100 - racefix)) / 100);

                let sizefix = 0;
                if(manualedits_get(monster, 602))
                    sizefix += manualedits_get(monster, 602).value;
                cardfix = Math.trunc((cardfix * (100 - sizefix)) / 100);

                let longrangefix = 0;
                if(manualedits_get(monster, 78))
                    longrangefix += manualedits_get(monster, 78).value;

                if(longrangefix && !skill_ignores_longcard(skill_id) && !(flag&BF.SHORT))
                    cardfix = Math.trunc((cardfix * (100 - longrangefix)) / 100);

                damage = APPLY_CARDFIX(damage, cardfix);
            }
            break;
    }

    battleDebug && console.log(`[battle_calc_cardfix] END â€” cardfix=${cardfix}, original_damage=${original_damage}, damage=${damage}, result=${cap_value(damage - original_damage, INT_MIN, INT_MAX)}`);
    return cap_value(damage - original_damage, INT_MIN, INT_MAX);
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function battle_calc_element_damage(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_element_damage] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);
    let sd = is_player_object(src) ? src : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let right_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_R);

    if(!skill_ignores_element(skill_id) && ((wd.getAverageDamage() > 0 || wd.getAverageDamage2() > 0) || (wd.getAverageCritDamage() > 0 || wd.getAverageCritDamage2() > 0))) {
        let left_element = battle_get_weapon_element(wd, src, target, skill_id, skill_lv, EQI.HAND_L);

        switch(skill_id) {
            case SKILL.PA_SACRIFICE:
                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                if(is_attack_left_handed(src, skill_id)) {
                    wd.damage2_min = battle_attr_fix(src, target, wd.damage2_min, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.damage2_max = battle_attr_fix(src, target, wd.damage2_max, left_element, tstatus.def_ele, tstatus.ele_lv, 1);

                    wd.crit_damage2_min = battle_attr_fix(src, target, wd.crit_damage2_min, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.crit_damage2_max = battle_attr_fix(src, target, wd.crit_damage2_max, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                }
                break;
            default:
                if(skill_id == 0 && is_monster_object(src))
                    return;

                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                if(is_attack_left_handed(src, skill_id)) {
                    wd.damage2_min = battle_attr_fix(src, target, wd.damage2_min, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.damage2_max = battle_attr_fix(src, target, wd.damage2_max, left_element, tstatus.def_ele, tstatus.ele_lv, 1);

                    wd.crit_damage2_min = battle_attr_fix(src, target, wd.crit_damage2_min, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.crit_damage2_max = battle_attr_fix(src, target, wd.crit_damage2_max, left_element, tstatus.def_ele, tstatus.ele_lv, 1);
                }
                break;
        }

        // forced to neutral skills
        switch(skill_id) {
            case SKILL.MC_CARTREVOLUTION:
            case SKILL.HW_MAGICCRASHER:
                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                if(is_attack_left_handed(src, skill_id)) {
                    wd.damage2_min = battle_attr_fix(src, target, wd.damage2_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.damage2_max = battle_attr_fix(src, target, wd.damage2_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);

                    wd.crit_damage2_min = battle_attr_fix(src, target, wd.crit_damage2_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                    wd.crit_damage2_max = battle_attr_fix(src, target, wd.crit_damage2_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                }
                break;
        }
    }

    // star crumb mastery bonuses apply even if attack misses
    if(sd && battle_skill_stacks_masteries_vvs(skill_id, BCHK.STAR)) {
        ATK_ADD4(wd, src, skill_id, sd.right_weapon.star, sd.right_weapon.star, sd.left_weapon.star, sd.left_weapon.star);
        CRIT_ATK_ADD4(wd, src, skill_id, sd.right_weapon.star, sd.right_weapon.star, sd.left_weapon.star, sd.left_weapon.star);
    }

    if(battle_skill_stacks_masteries_vvs(skill_id, BCHK.ALL)) {
        ATK_ADD(wd, src, skill_id, battle_get_spiritball_damage(wd, src, skill_id));
        CRIT_ATK_ADD(wd, src, skill_id, battle_get_spiritball_damage(wd, src, skill_id));

        switch(skill_id) {
            case SKILL.TF_POISON:
                ATK_ADD(wd, src, skill_id, 15 * skill_lv);
                CRIT_ATK_ADD(wd, src, skill_id, 15 * skill_lv);

                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, right_element, tstatus.def_ele, tstatus.ele_lv, 1);
                break;
            case SKILL.NJ_SYURIKEN:
                ATK_ADD(wd, src, skill_id, 4 * skill_lv);
                CRIT_ATK_ADD(wd, src, skill_id, 4 * skill_lv);
                if(src.type == BL.PC) {
                    ATK_ADD(wd, src, skill_id, 3 * SkillSearch(SKILL.NJ_TOBIDOUGU));
                    ATK_ADD(wd, src, skill_id, m_Syuriken[1 * c.SkillSubNum.value][0]);
                }

                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                break;
            case SKILL.NJ_KUNAI:
                if(src.type == BL.PC) {
                    ATK_ADD(wd, src, skill_id, 3 * m_Kunai[1 * c.SkillSubNum.value][0]);
                }
                
                wd.damage_min = battle_attr_fix(src, target, wd.damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.damage_max = battle_attr_fix(src, target, wd.damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);

                wd.crit_damage_min = battle_attr_fix(src, target, wd.crit_damage_min, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                wd.crit_damage_max = battle_attr_fix(src, target, wd.crit_damage_max, ELE.NEUTRAL, tstatus.def_ele, tstatus.ele_lv, 1);
                break;
        }
    }

    if(sd && !skill_ignores_element(skill_id) && !skill_ignores_atkcard(skill_id) && ((wd.getAverageDamage() > 0 || wd.getAverageDamage2() > 0) || (wd.getAverageCritDamage() > 0 || wd.getAverageCritDamage2() > 0))) {
        if(SkillSearch(SKILL.ASC_EDP)) {
            let edp_rate = 30 * (SkillSearch(SKILL.ASC_EDP) + 0);

            if(skill_id == SKILL.ASC_METEORASSAULT || skill_id == SKILL.ASC_BREAKER || skill_id == SKILL.AS_SPLASHER) {
                if(skill_id == SKILL.ASC_METEORASSAULT && (EquipNumSearch(388) > 0 || EquipNumSearch(607) > 0 || c.A8_Skill14 == 1))
                    edp_rate = Math.trunc(edp_rate * 50 / 100); // if using ice pick with meteor assault, edp rate is further halved to 5% of normal

                // If dual wielding, reduce EDP rate on right hand to compensate for left hand base damage
                    if(sd && sd.dual_wield)
                        edp_rate = Math.trunc(edp_rate * 70 / 100); // dual wield: EDP right hand reduced to 70% of normal

                if(skill_id == SKILL.ASC_BREAKER) {
                    if(EquipNumSearch(388) > 0 || EquipNumSearch(607) > 0 || c.A8_Skill14 == 1)
                        edp_rate = Math.trunc(edp_rate * (100 / 2) / 100); // if using ice pick with soul destroyer, edp rate is 16.5% of normal
                    else
                        edp_rate = Math.trunc(edp_rate * 100 / 100); // if using soul destroyer edp rate is 33% of normal

                    // If dual wielding, reduce EDP rate on right hand to compensate for left hand base damage
                    if(sd && sd.dual_wield)
                        edp_rate = Math.trunc(edp_rate * 70 / 100); // dual wield: EDP right hand reduced to 70% of normal
                }

                if(skill_id == SKILL.AS_SPLASHER) {
                    if(EquipNumSearch(388) > 0 || EquipNumSearch(607) > 0 || c.A8_Skill14 == 1)
                        edp_rate = Math.trunc(edp_rate * (100 / 2) / 100); // if using ice pick with splasher, edp rate is 12.5% of normal
                    else
                        edp_rate = 30 * (SkillSearch(SKILL.ASC_EDP) + 0); // if using other weapons with splasher, edp rate is 25% of normal

                    // If dual wielding, reduce EDP rate on right hand to compensate for left hand base damage
                    if(sd && sd.dual_wield)
                        edp_rate = Math.trunc(edp_rate * 70/ 100); // dual wield: EDP right hand reduced to 70% of normal
                }
            }
            battleDebug && console.log(`[battle_calc_element_damage] EDP â€” edp_lv=${SkillSearch(SKILL.ASC_EDP)}, edp_rate=${edp_rate}, damage_min before=${wd.damage_min}, damage_max before=${wd.damage_max}, crit_damage_min before=${wd.crit_damage_min}, crit_damage_max before=${wd.crit_damage_max}`);
            wd.damage_min += Math.trunc((wd.damage_min * edp_rate) / 100);
            wd.damage_max += Math.trunc((wd.damage_max * edp_rate) / 100);

            wd.crit_damage_min += Math.trunc((wd.crit_damage_min * edp_rate) / 100);
            wd.crit_damage_max += Math.trunc((wd.crit_damage_max * edp_rate) / 100);
            battleDebug && console.log(`[battle_calc_element_damage] after EDP â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        }

        if(sc_get(player, SC.WATK_ELEMENT) || SkillSearch(SKILL.ASC_EDP)) { // magnum break bonus (edp also gives a similar bonus)
            let watk_element = SkillSearch(SKILL.ASC_EDP) ? ELE.POISON : ELE.FIRE;
            let watk_bonus = SkillSearch(SKILL.ASC_EDP) ? 25 : 20;
            battleDebug && console.log(`[battle_calc_element_damage] magnum/edp bonus â€” watk_element=${watk_element}, watk_bonus=${watk_bonus}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);

            wd.basedamage_min = battle_attr_fix(src, target, wd.basedamage_min, watk_element, tstatus.def_ele, tstatus.ele_lv, 1);
            wd.basedamage_max = battle_attr_fix(src, target, wd.basedamage_max, watk_element, tstatus.def_ele, tstatus.ele_lv, 1);

            wd.crit_basedamage_min = battle_attr_fix(src, target, wd.crit_basedamage_min, watk_element, tstatus.def_ele, tstatus.ele_lv, 1);
            wd.crit_basedamage_max = battle_attr_fix(src, target, wd.crit_basedamage_max, watk_element, tstatus.def_ele, tstatus.ele_lv, 1);
            battleDebug && console.log(`[battle_calc_element_damage] after attr_fix â€” basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);

            wd.basedamage_min += sd.right_weapon.star;
            wd.basedamage_max += sd.right_weapon.star;

            wd.crit_basedamage_min += sd.right_weapon.star;
            wd.crit_basedamage_max += sd.right_weapon.star;
            battleDebug && console.log(`[battle_calc_element_damage] after star crumb (${sd.right_weapon.star}) â€” basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}`);

            wd.basedamage_min += battle_get_spiritball_damage(wd, src, skill_id);
            wd.basedamage_max += battle_get_spiritball_damage(wd, src, skill_id);

            wd.crit_basedamage_min += battle_get_spiritball_damage(wd, src, skill_id);
            wd.crit_basedamage_max += battle_get_spiritball_damage(wd, src, skill_id);
            battleDebug && console.log(`[battle_calc_element_damage] after spiritball (${battle_get_spiritball_damage(wd, src, skill_id)}) â€” basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}`);

            wd.damage_min += Math.trunc((wd.basedamage_min * watk_bonus) / 100);
            wd.damage_max += Math.trunc((wd.basedamage_max * watk_bonus) / 100);

            wd.crit_damage_min += Math.trunc((wd.crit_basedamage_min * watk_bonus) / 100);
            wd.crit_damage_max += Math.trunc((wd.crit_basedamage_max * watk_bonus) / 100);
            battleDebug && console.log(`[battle_calc_element_damage] after magnum/edp final bonus â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
        }
    }

    battle_min_damage(wd, src, skill_id, 0);
    battleDebug && console.log(`[battle_calc_element_damage] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} damage 
 * @param {ELE} atk_elem 
 * @param {ELE} def_type 
 * @param {number} def_lv 
 * @param {number} flag 
 * @returns 
 */
function battle_attr_fix(src, target, damage, atk_elem, def_type, def_lv, flag) {
    battleDebug && console.log(`[battle_attr_fix] START â€” damage=${damage}, atk_elem=${atk_elem}, def_type=${def_type}, def_lv=${def_lv}`);
    let ratio;

    ratio = get_element_modifier(atk_elem, def_lv, def_type);

    switch(atk_elem) {
        case ELE.FIRE:
            if(src.type == BL.PC) {
                if(sc_get(src, SC.VOLCANO))
                    damage += Math.trunc((damage * sc_get(src, SC.VOLCANO).val3) / 100);

                if(sc_get(target, SC.SPIDERWEB)) // spider web
                    damage *= 2;
            }
            break;
        case ELE.WIND:
            if(src.type == BL.PC) {
                if(sc_get(src, SC.WHIRLWIND))
                    damage += Math.trunc((damage * sc_get(src, SC.WHIRLWIND).val3) / 100);
            }
            break;
        case ELE.WATER:
            if(src.type == BL.PC) {
                if(sc_get(src, SC.DELUGE))
                    damage += Math.trunc((damage * sc_get(src, SC.DELUGE).val3) / 100);
            }
            break;
    }

    if(!(flag & 1) && ratio < 0)
        ratio = 0;

    damage = Math.trunc((damage * ratio) / 100);

    battleDebug && console.log(`[battle_attr_fix] END â€” ratio=${ratio}, damage=${damage}`);
    return damage;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @returns 
 */
function battle_get_spiritball_damage(wd, src, skill_id) {
    if(src.type != BL.PC)
        return 0;

    let damage = 3 * src.spiritball; // number of spiritballs

    if(SkillSearch(SKILL.GS_GLITTERING) > 0)
        damage = 3 * SkillSearch(SKILL.GS_GLITTERING); // glittering bonus overrides spiritball count

    return damage;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_attack_post_defense(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_post_defense] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
    let sd = is_player_object(src) ? src : null;
    let sstatus = status_get_status_data(src);

    // refine bonus
    if(sd) {
        if(battle_skill_stacks_masteries_vvs(skill_id, BCHK.REFINE)) {
            battleDebug && console.log(`[battle_calc_attack_post_defense] Refine bonus â€” rhw.atk2=${sstatus.rhw.atk2}, lhw.atk2=${sstatus.lhw.atk2}`);
            ATK_ADD4(wd, src, skill_id, sstatus.rhw.atk2, sstatus.rhw.atk2, sstatus.lhw.atk2, sstatus.lhw.atk2);
            CRIT_ATK_ADD4(wd, src, skill_id, sstatus.rhw.atk2, sstatus.rhw.atk2, sstatus.lhw.atk2, sstatus.lhw.atk2);
        }
        wd.basedamage_min += sstatus.rhw.atk2;
        wd.basedamage_max += sstatus.rhw.atk2;
        wd.crit_basedamage_min += sstatus.rhw.atk2;
        wd.crit_basedamage_max += sstatus.rhw.atk2;
    }
    
    battle_min_damage(wd, src, skill_id, 1);

    battle_calc_attack_masteries(wd, src, target, skill_id, skill_lv);

    if(sd) {
        if(SkillSearch(SKILL.LK_AURABLADE) && skill_id != SKILL.LK_SPIRALPIERCE) {
            battleDebug && console.log(`[battle_calc_attack_post_defense] Aura Blade bonus: +${20 * SkillSearch(SKILL.LK_AURABLADE)}`);
            ATK_ADD(wd, src, skill_id, 20 * SkillSearch(SKILL.LK_AURABLADE));
            CRIT_ATK_ADD(wd, src, skill_id, 20 * SkillSearch(SKILL.LK_AURABLADE));
        }
    }

    battle_min_damage(wd, src, skill_id, 1);
    battleDebug && console.log(`[battle_calc_attack_post_defense] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_attack_masteries(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_masteries] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
    let sd = is_player_object(src) ? src : null;
    
    if(sd) {
        wd.basedamage_min = battle_addmastery(src, target, wd.basedamage_min, 0);
        wd.basedamage_max = battle_addmastery(src, target, wd.basedamage_max, 0);

        wd.crit_basedamage_min = battle_addmastery(src, target, wd.crit_basedamage_min, 0);
        wd.crit_basedamage_max = battle_addmastery(src, target, wd.crit_basedamage_max, 0);
    }

    if(sd && battle_skill_stacks_masteries_vvs(skill_id, BCHK.ALL)) {
        let skill;

        wd.damage_min = battle_addmastery(src, target, wd.damage_min, 0);
        wd.damage_max = battle_addmastery(src, target, wd.damage_max, 0);
        wd.crit_damage_min = battle_addmastery(src, target, wd.crit_damage_min, 0);
        wd.crit_damage_max = battle_addmastery(src, target, wd.crit_damage_max, 0);
        if(is_attack_left_handed(src, skill_id)) {
            wd.damage2_min = battle_addmastery(src, target, wd.damage2_min, 1);
            wd.damage2_max = battle_addmastery(src, target, wd.damage2_max, 1);

            wd.crit_damage2_min = battle_addmastery(src, target, wd.crit_damage2_min, 1);
            wd.crit_damage2_max = battle_addmastery(src, target, wd.crit_damage2_max, 1);
        }
    }
    battleDebug && console.log(`[battle_calc_attack_masteries] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}, crit_damage2_min=${wd.crit_damage2_min}, crit_damage2_max=${wd.crit_damage2_max}`);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} dmg 
 * @param {number} type 
 * @returns 
 */
function battle_addmastery(src, target, dmg, type) {
    battleDebug && console.log(`[battle_addmastery] START â€” dmg=${dmg}, type=${type}`);
    let sd = is_player_object(src) ? src : null;
    if(!sd)
        return 0;

    let status = status_get_status_data(target);
    let damage;
    let weapon, skill;

    damage = dmg;

    if((skill = SkillSearch(SKILL.AL_DEMONBANE)) > 0 && target.type == BL.MOB && (battle_check_undead(status.race, status.def_ele) || status.race == RC.DEMON))
        damage += Math.trunc(skill * (sd.status.base_level / 20 + 3));
    if((skill = SkillSearch(SKILL.HT_BEASTBANE)) > 0 && (status.race == RC.INSECT || status.race == RC.BRUTE)) {
        damage += skill * 4;
        if(SkillSearch(SKILL.SL_HUNTER))
            damage += sd.status.str;
    }

    if((skill = SkillSearch(SKILL.NV_BREAKTHROUGH)) > 0)
        damage += 100;

    if(type == 0)
        weapon = sd.weapontype1;
    else
        weapon = sd.weapontype2;

    switch(weapon) {
        case WEAPON.ONEHANDSWORD:
        case WEAPON.DAGGER:
            if((skill = SkillSearch(SKILL.SM_SWORD)) > 0)
                damage += skill * 4;
            break;
        case WEAPON.TWOHANDSWORD:
            if((skill = SkillSearch(SKILL.SM_TWOHAND)) > 0)
                damage += skill * 4;
            break;
        case WEAPON.ONEHANDSPEAR:
        case WEAPON.TWOHANDSPEAR:
            if((skill = SkillSearch(SKILL.KN_SPEARMASTERY)) > 0) {
                if(SkillSearch(SKILL.KN_CAVALIERMASTERY))
                    damage += skill * 5;
                else
                    damage += skill * 4;
            }
            break;
        case WEAPON.ONEHANDAXE:
        case WEAPON.TWOHANDAXE:
            if((skill = SkillSearch(SKILL.AM_AXEMASTERY)) > 0)
                damage += skill * 3;
            break;
        case WEAPON.MACE:
            if((skill = SkillSearch(SKILL.PR_MACEMASTERY)) > 0)
                damage += skill * 4;
            break;
        case WEAPON.FIST:
            if((skill = SkillSearch(SKILL.TK_RUN)) > 0)
                damage += skill * 10;
        case WEAPON.KNUCKLE:
            if((skill = SkillSearch(SKILL.MO_IRONHAND)) > 0)
                damage += skill * 3;
            break;
        case WEAPON.INSTRUMENT:
            if((skill = SkillSearch(SKILL.BA_MUSICALLESSON)) > 0)
                damage += skill * 3;
            break;
        case WEAPON.WHIP:
            if((skill = SkillSearch(SKILL.DC_DANCINGLESSON)) > 0)
                damage += skill * 3;
            break;
        case WEAPON.BOOK:
            if((skill = SkillSearch(SKILL.SA_ADVANCEDBOOK)) > 0)
                damage += skill * 3;
            break;
        case WEAPON.KATAR:
            if((skill = SkillSearch(SKILL.AS_KATAR)) > 0)
                damage += skill * 3;
            break;
    }

    battleDebug && console.log(`[battle_addmastery] END â€” damage=${damage} (added ${damage - dmg})`);
    return damage;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @param {number} min 
 */
function battle_min_damage(wd, src, skill_id, min) {
    battleDebug && console.log(`[battle_min_damage] min=${min}, damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
    if(is_attack_right_handed(src, skill_id)) {
        wd.damage_min = cap_value(wd.damage_min, min, INT64_MAX);
        wd.damage_max = cap_value(wd.damage_max, min, INT64_MAX);
        wd.basedamage_min = cap_value(wd.basedamage_min, min, INT64_MAX);
        wd.basedamage_max = cap_value(wd.basedamage_max, min, INT64_MAX);

        wd.crit_damage_min = cap_value(wd.crit_damage_min, min, INT64_MAX);
        wd.crit_damage_max = cap_value(wd.crit_damage_max, min, INT64_MAX);
        wd.crit_basedamage_min = cap_value(wd.crit_basedamage_min, min, INT64_MAX);
        wd.crit_basedamage_max = cap_value(wd.crit_basedamage_max, min, INT64_MAX);
    }

    if(is_attack_left_handed(src, skill_id)) {
        wd.damage2_min = cap_value(wd.damage2_min, min, INT64_MAX);
        wd.damage2_max = cap_value(wd.damage2_max, min, INT64_MAX);

        wd.crit_damage2_min = cap_value(wd.crit_damage2_min, min, INT64_MAX);
        wd.crit_damage2_max = cap_value(wd.crit_damage2_max, min, INT64_MAX);
    }
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_attack_sc_bonus(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_attack_sc_bonus] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    let sd = is_player_object(src) ? src : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let anger_id = 0;

    ATK_RATE(wd, src, skill_id, battle_get_atkpercent(src, skill_id));
    CRIT_ATK_RATE(wd, src, skill_id, battle_get_atkpercent(src, skill_id));
    battleDebug && console.log(`[battle_attack_sc_bonus] After atkpercent â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
    wd.basedamage_min = ATK_RATER(wd.basedamage_min, battle_get_atkpercent(src, 0));
    wd.basedamage_max = ATK_RATER(wd.basedamage_max, battle_get_atkpercent(src, 0));
    wd.crit_basedamage_min = ATK_RATER(wd.crit_basedamage_min, battle_get_atkpercent(src, 0));
    wd.crit_basedamage_max = ATK_RATER(wd.crit_basedamage_max, battle_get_atkpercent(src, 0));

    if(sd) {
        if(skill_id == SKILL.AS_SONICBLOW_SL) {
            ATK_ADDRATE(wd, src, skill_id, c.A8_Skill14.value == 1 ? 25 : 100);
            CRIT_ATK_ADDRATE(wd, src, skill_id, c.A8_Skill14.value == 1 ? 25 : 100);
        }

        if(skill_id == SKILL.CR_SHIELDBOOMERANG_SL) {
            ATK_ADDRATE(wd, src, skill_id, 100);
            CRIT_ATK_ADDRATE(wd, src, skill_id, 100);
        }

        let anger_level = 0;
        if(SkillSearch(SKILL.SG_SUN_ANGER) || SkillSearch(SKILL.SG_MOON_ANGER) || SkillSearch(SKILL.SG_STAR_ANGER)) {
            if(SkillSearch(SKILL.SG_STAR_ANGER)) {
                anger_id = 2;
                anger_level = SkillSearch(SKILL.SG_STAR_ANGER);
            } else if(SkillSearch(SKILL.SG_MOON_ANGER)) {
                anger_id = 1;
                anger_level = SkillSearch(SKILL.SG_MOON_ANGER);
            } else if(SkillSearch(SKILL.SG_SUN_ANGER)) {
                anger_id = 0;
                anger_level = SkillSearch(SKILL.SG_SUN_ANGER);
            }

            if(SkillSearch(SKILL.SG_MIRACLE))
                anger_id = 2;

            let skillratio = sd.status.base_level + sstatus.dex + sstatus.luk;
            if(anger_id == 2)
                skillratio += sstatus.str;

            if(anger_level < 4)
                skillratio = Math.trunc(skillratio / (12 - 3 * anger_level));

            ATK_ADDRATE(wd, src, skill_id, skillratio);
            CRIT_ATK_ADDRATE(wd, src, skill_id, skillratio);
        }
    }
    battleDebug && console.log(`[battle_attack_sc_bonus] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function battle_calc_skill_constant_addition(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_skill_constant_addition] START skill_id=${skill_id}`);
    let sd = is_player_object(src) ? src : null;
    let tsd = is_player_object(target) ? target : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let atk_min = 0, atk_max = 0;

    switch(skill_id) {
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
            atk_min = atk_max = 250 + 150 * skill_lv;
            break;
        case SKILL.PA_SHIELDCHAIN:
            if(sd) {
                if(sd.equip[EQI.SHIELD] >= 0) {
                    let bonus = Math.trunc((7 * c.SkillSubNum.value) / 10);
                    bonus += Math.trunc(Math.pow(skill_lv + sd.refine[EQI.SHIELD], 2));
                    atk_min = 100;
                    atk_max = Math.max(100, bonus);
                    battleDebug && console.log(`[battle_calc_skill_constant_addition] Shield Chain â€” shield refine=${sd.refine[EQI.SHIELD]}, bonus=${bonus}, atk_min=${atk_min}, atk_max=${atk_max}`);
                }
            }
            break;
        case SKILL.GS_MAGICALBULLET:
            if(sstatus.matk_max > sstatus.matk_min) {
                atk_min = sstatus.matk_min;
                atk_max = sstatus.matk_max - 1;
            } else {
                atk_min = atk_max = sstatus.matk_min;
            }

            break;
    }
    battleDebug && console.log(`[battle_calc_skill_constant_addition] END â€” atk_min=${atk_min}, atk_max=${atk_max}`);
    return { min: atk_min, max: atk_max };
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {*} skill_id 
 * @param {*} skill_lv 
 * @returns 
 */
function battle_calc_attack_skill_ratio(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_attack_skill_ratio] START skill_id=${skill_id}`);
    let sd = is_player_object(src) ? src : null;
    let tsd = is_player_object(target) ? target : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let skillratio = 100;
    let i;

    if(sd && skill_id != SKILL.PA_SACRIFICE) {
        if(SkillSearch(SKILL.WS_OVERTHRUSTMAX))
            skillratio += SkillSearch(SKILL.WS_OVERTHRUSTMAX) * 20;
        else if(SkillSearch(SKILL.BS_OVERTHRUST) || sc_get(src, SC.OVERTHRUST))
            skillratio += SkillSearch(SKILL.BS_OVERTHRUST) ? SkillSearch(SKILL.BS_OVERTHRUST) * 5 : 5;

        if(SkillSearch(SKILL.LK_BERSERK))
            skillratio += 100;

        if(skill_id == SKILL.AS_POISONREACT)
            skillratio += 30 * skill_lv;
    }

    switch(skill_id) {
        case SKILL.SM_BASH:
            skillratio += 30 * skill_lv;
            break;
        case SKILL.SM_MAGNUM:
            skillratio += 20 * skill_lv; 
			break;
		case SKILL.MC_MAMMONITE:
			skillratio += 50 * skill_lv;
			break;
		case SKILL.HT_POWER:
			skillratio += -50 + 8 * sstatus.str;
			break;
		case SKILL.AC_DOUBLE:
			skillratio += 10 * (skill_lv - 1);
			break;
		case SKILL.AC_SHOWER:
			skillratio += -25 + 5 * skill_lv;
			break;
		case SKILL.AC_CHARGEARROW:
			skillratio += 50;
			break;
		case SKILL.KN_PIERCE:
			skillratio += 15 * skill_lv;
			break;
		case SKILL.KN_SPEARSTAB:
			skillratio += 20 * skill_lv;
			break;
		case SKILL.KN_SPEARBOOMERANG:
			skillratio += 50 * skill_lv;
			break;
		case SKILL.KN_BRANDISHSPEAR:
            skillratio += 60 * skill_lv;
            	break;
        case SKILL.KN_BOWLINGBASH:
			skillratio += 40 * skill_lv;
			break;
		case SKILL.AS_GRIMTOOTH:
			skillratio += 42 * skill_lv;
			break;
		case SKILL.AS_SONICBLOW:
        case SKILL.AS_SONICBLOW_SL:
			skillratio += 650 + 50 * skill_lv;
			if (sd && SkillSearch(SKILL.AS_SONICACCEL) > 0)
				skillratio += Math.trunc(skillratio / 10); // +10% damage with Sonic Acceleration
			break;
		case SKILL.TF_SPRINKLESAND:
			skillratio += 30;
			break;
		case SKILL.MC_CARTREVOLUTION:
			skillratio += 50;
            skillratio += 100; // always uses max cart weight
			break;
		case SKILL.NPC_PIERCINGATT:
			skillratio += -25; //75% base damage
			break;
		case SKILL.NPC_COMBOATTACK:
			skillratio += 25 * skill_lv;
			break;
		case SKILL.NPC_RANDOMATTACK:
		case SKILL.NPC_WATERATTACK:
		case SKILL.NPC_GROUNDATTACK:
		case SKILL.NPC_FIREATTACK:
		case SKILL.NPC_WINDATTACK:
		case SKILL.NPC_POISONATTACK:
		case SKILL.NPC_HOLYATTACK:
		case SKILL.NPC_DARKNESSATTACK:
		case SKILL.NPC_UNDEADATTACK:
		case SKILL.NPC_TELEKINESISATTACK:
		case SKILL.NPC_BLOODDRAIN:
		case SKILL.NPC_ACIDBREATH_MELEE:
        case SKILL.NPC_ACIDBREATH_RANGED:
		case SKILL.NPC_DARKNESSBREATH_MELEE:
        case SKILL.NPC_DARKNESSBREATH_RANGED:
		case SKILL.NPC_FIREBREATH_MELEE:
        case SKILL.NPC_FIREBREATH_RANGED:
		case SKILL.NPC_ICEBREATH_MELEE:
        case SKILL.NPC_ICEBREATH_RANGED:
		case SKILL.NPC_THUNDERBREATH_MELEE:
        case SKILL.NPC_THUNDERBREATH_RANGED:
		case SKILL.NPC_HELLJUDGEMENT_MELEE:
        case SKILL.NPC_HELLJUDGEMENT_RANGED:
		case SKILL.NPC_PULSESTRIKE_MELEE:
        case SKILL.NPC_PULSESTRIKE_RANGED:
			skillratio += 100 * (skill_lv - 1);
			break;
		case SKILL.RG_BACKSTAP:
			if(sd && sd.status.weapon == WEAPON.BOW) {
                skillratio += Math.trunc((200 + 40 * skill_lv) / 2);
            } else if(sd && sd.status.weapon == WEAPON.DAGGER) {
                skillratio += (110 + 22 * skill_lv);
            } else {
                skillratio += 200 + 40 * skill_lv;
            }
			break;
		case SKILL.RG_RAID:
			skillratio += 40 * skill_lv;
			break;
		case SKILL.RG_INTIMIDATE:
			skillratio += 30 * skill_lv;
			break;
		case SKILL.CR_SHIELDCHARGE:
			skillratio += 20 * skill_lv;
			break;
		case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
			skillratio += 30 * skill_lv;
			break;
		case SKILL.NPC_DARKCROSS:
            skillratio += 35 * skill_lv;
            break;
		case SKILL.CR_HOLYCROSS:
            skillratio += 35 * skill_lv;
            if(sd && sd.status.weapon == WEAPON.TWOHANDSPEAR)
                skillratio *= 2;
			break;
		case SKILL.MO_FINGEROFFENSIVE:
			skillratio += 50 * skill_lv;
			break;
		case SKILL.MO_INVESTIGATE:
			skillratio += 75 * skill_lv;
			break;
		case SKILL.MO_EXTREMITYFIST:
            if(src.type == BL.PC)
			    skillratio += 700 + (1 * c.SkillSubNum.value) * 10;
            else
                skillratio += 700;
            break;
        case SKILL.MO_EXTREMITYFIST_MAXSP:
            skillratio += 700 + (sstatus.max_sp) * 10;
			break;
		case SKILL.MO_TRIPLEATTACK:
			skillratio += 20 * skill_lv;
			break;
		case SKILL.MO_CHAINCOMBO:
			skillratio += 50 + 50 * skill_lv;
            if(sd && sd.status.weapon == WEAPON.KNUCKLE)
                skillratio *= 2;
			break;
		case SKILL.MO_COMBOFINISH:
			skillratio += 140 + 60 * skill_lv;
			break;
		case SKILL.BA_MUSICALSTRIKE:
		case SKILL.DC_THROWARROW:
			skillratio += 25 + 25 * skill_lv;
			break;
        case SKILL.CH_TIGERFIST:
			skillratio += -60 + 100 * skill_lv;
            if(sd && sd.status.weapon == WEAPON.KNUCKLE)
                skillratio *= 2;
			break;
		case SKILL.CH_CHAINCRUSH:
			skillratio += 300 + 100 * skill_lv;
			break;
		case SKILL.CH_PALMSTRIKE:
			skillratio += 100 + 100 * skill_lv;
			break;
		case SKILL.LK_HEADCRUSH:
			skillratio += 40 * skill_lv;
			break;
		case SKILL.LK_JOINTBEAT:
			skillratio += 10 * skill_lv - 50;
			break;
		case SKILL.ASC_METEORASSAULT:
			skillratio = + 32 * skill_lv;
			break;
		case SKILL.SN_SHARPSHOOTING:
			skillratio += 100 + 50 * skill_lv;
			break;
		case SKILL.CG_ARROWVULCAN:
			skillratio += 100 + 100 * skill_lv;
			break;
		case SKILL.AS_SPLASHER:
			skillratio = 100 + 50 * skill_lv;
			if(sd)
				skillratio += 20 * SkillSearch(SKILL.AS_POISONREACT);
			break;
		case SKILL.ASC_BREAKER:
			skillratio += -100 + 60 * skill_lv;
			break;
		case SKILL.PA_SACRIFICE:
			skillratio += -10 + 10 * skill_lv;
			break;
		case SKILL.PA_SHIELDCHAIN:
			skillratio += 30 * skill_lv;
			break;
		case SKILL.WS_CARTTERMINATION:
			skillratio += 300 + 80 * skill_lv;
			break;
		case SKILL.TK_DOWNKICK:
        case SKILL.TK_STORMKICK:
            skillratio += 60 + 20 * skill_lv;
            break;
		case SKILL.TK_COUNTER:
        case SKILL.TK_TURNKICK:
            skillratio += 90 + 30 * skill_lv;
            break;
		case SKILL.TK_JUMPKICK:
            skillratio += -70 + 10 * skill_lv;
			break;
        case SKILL.TK_JUMPKICK_SPRINT:
            skillratio += -100 + 4 * sd.status.base_level;
            if(SkillSearch(SKILL.TK_RUN_STR))
                skillratio *= 2;
            break;
		case SKILL.GS_TRIPLEACTION:
			skillratio += 50 * skill_lv;
			break;
		case SKILL.GS_BULLSEYE:
            if((tstatus.race == RC.BRUTE || tstatus.race == RC.DEMIHUMAN) && target.battle_status.class_ != CLASS.BOSS)
                skillratio += 400;
			break;
		case SKILL.GS_TRACKING:
			skillratio += 100 * (skill_lv + 1);
			break;
		case SKILL.GS_PIERCINGSHOT:
			skillratio += 20 * skill_lv;
			break;
		case SKILL.GS_RAPIDSHOWER:
			skillratio += 400 + 50 * skill_lv;
			break;
		case SKILL.GS_DESPERADO:
			skillratio += 50 * (skill_lv - 1);
			break;
		case SKILL.GS_DUST:
			skillratio += 50 * skill_lv;
			break;
		case SKILL.GS_FULLBUSTER:
			skillratio += 100 * (skill_lv + 2);
			break;
		case SKILL.GS_SPREADATTACK:
			skillratio += 20 * (skill_lv - 1);
			break;
		case SKILL.NJ_HUUMA:
			skillratio += 100 + 250 * (skill_lv - 1);
			break;
		case SKILL.NJ_TATAMIGAESHI:
			skillratio += 10 * skill_lv;
			break;
		case SKILL.NJ_KASUMIKIRI:
			skillratio += 10 * skill_lv;
			break;
		case SKILL.NJ_KIRIKAGE:
			skillratio += 100 * (skill_lv - 1);
			break;
		case SKILL.KN_CHARGEATK:  // +100% every 3 cells of distance but hard-limited to 500%
            if(sd) {
                let k = 1 * c.SkillSubNum.value;
                if (k < 0)
                    k = 0;
                else if (k > 4)
                    k = 4;
                skillratio += 100 * k;
            }
			break;
		case SKILL.HT_PHANTASMIC:
			skillratio += 50;
			break;
		case SKILL.MO_BALKYOUNG:
			skillratio += 200;
			break;
        case SKILL.NPC_VAMPIRE_GIFT:
            skillratio += Math.trunc((skill_lv - 1) % 5 + 1) * 100;
            break;
        case SKILL.CD_EFFLIGO:
            skillratio += -100 + 1650 * skill_lv;
            break;
        case SKILL.RL_FIREDANCE:
            skillratio += 100 + 100 * skill_lv;
            skillratio += (sd ? c.SkillSubNum.value * 20 : 0);
            break;
        case SKILL.AM_ACIDTERROR:
            skillratio = 144 * skill_lv;
            break;
    }

    battleDebug && console.log(`[battle_calc_attack_skill_ratio] END â€” skillratio=${skillratio}`);
    return skillratio;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_skill_base_damage(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_skill_base_damage] START skill_id=${skill_id}, skill_lv=${skill_lv}`);
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let sd = is_player_object(src) ? src : null;
    let tsd = is_player_object(target) ? target : null;
    let bflag = BDMG.NONE;
    let i;

    switch(skill_id) {
        case SKILL.PA_SACRIFICE:
            wd.damage_min = wd.damage_max = Math.trunc(sstatus.max_hp * 9 / 100);
            wd.damage2_min = wd.damage2_max = 0;
            break;
        case SKILL.NJ_ISSEN_MAXHP:
            wd.damage_min = wd.damage_max = 40 * sstatus.str + Math.trunc(sstatus.max_hp * 8 * skill_lv / 100);
            wd.damage2_min = wd.damage2_max = 0;
            break;
        case SKILL.NJ_ISSEN:
            wd.damage_min = wd.damage_max = 40 * sstatus.str + Math.trunc(c.SkillSubNum.value * 8 * skill_lv / 100);
            wd.damage2_min = wd.damage2_max = 0;
            break;
        case SKILL.LK_SPIRALPIERCE:
            if(sd) {
                if(sd.equip[EQI.HAND_R] >= 0)
                    wd.damage_min = wd.damage_max = Math.trunc(c.SkillSubNum.value * 8 / 10); // 80% of weapon weight as base damage

                ATK_ADDRATE(wd, src, skill_id, 50 * skill_lv); // 50 * skillLV ratio
            } else {
                let base_damage = battle_calc_base_damage(src, sstatus, sstatus.rhw, tstatus.size, 0);
                wd.damage_min = base_damage.min;
                wd.damage_max = base_damage.max;
            }

            i = Math.trunc(sstatus.str / 10);
            i *= i;
            ATK_ADD(wd, src, skill_id, i); // str bonus
            switch(tstatus.size) {
                case SZ.SMALL:
                    ATK_RATE(wd, src, skill_id, 125); // +25% damage to small targets
                    break;
                case SZ.LARGE:
                    ATK_RATE(wd, src, skill_id, 75); 
                    break;
            }
            wd.crit_basedamage_min = wd.basedamage_min;
            wd.crit_basedamage_max = wd.basedamage_max;
            wd.crit_damage_min = wd.damage_min;
            wd.crit_damage_max = wd.damage_max;
            break;
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
        case SKILL.PA_SHIELDCHAIN:
            wd.damage_min = wd.damage_max = sstatus.batk;
            if(sd) {
                battleDebug && console.log(`[battle_calc_skill_base_damage] Shield Chain / Shield Boomerang â€” base damage from batk: ${wd.damage_min}`);
                if(sd.equip[EQI.SHIELD] >= 0) {
                    ATK_ADD(wd, src, skill_id, 4 * sd.refine[EQI.SHIELD]);
                    ATK_ADD(wd, src, skill_id, 1 * c.SkillSubNum.value); // shield weight added as flat damage
                }
                battleDebug && console.log(`[battle_calc_skill_base_damage] After shield refine and weight addition â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}`);

                battle_calc_defense_reduction(wd, src, target, skill_id, skill_lv);
            } else {
                ATK_ADD(wd, src, skill_id, sstatus.rhw.atk2); // monster use atk2 
            }
            wd.crit_basedamage_min = wd.basedamage_min;
            wd.crit_basedamage_max = wd.basedamage_max;
            wd.crit_damage_min = wd.damage_min;
            wd.crit_damage_max = wd.damage_max;
            break;
        default:
            // got here
            bflag = BDMG.NONE;
            // crit is no longer using flags to set the damage as "crit" since its a separate damage field
            // if(is_attack_critical(wd, src, target, skill_id, skill_lv, false)) bflag |= BDMG.CRIT;
            if(skill_id == SKILL.HW_MAGICCRASHER) bflag |= BDMG.MAGIC;
            if(sd && sc_get(src, SC.WEAPONPERFECTION)) bflag |= BDMG.NOSIZE; // weapon perfection

            if(is_skill_using_arrow(src, skill_id) && sd) {
                switch(sd.status.weapon) {
                    case WEAPON.BOW:
                        bflag |= BDMG.ARROW;
                        break;
                    case WEAPON.REVOLVER:
                    case WEAPON.RIFLE:
                    case WEAPON.GATLING:
                    case WEAPON.SHOTGUN:
                    case WEAPON.GRENADE:
                        //if(!(bflag & BDMG.CRIT)) - crit is no longer using flags, so we don't need to check for it here
                        bflag |= BDMG.ARROW;
                        break;
                }
            }
            /* if(skill_id == SKILL.SN_SHARPSHOOTING)
                bflag &= ~(BDMG.CRIT); */
            let right_base_damage = battle_calc_base_damage(src, sstatus, sstatus.rhw, tstatus.size, bflag);
            wd.damage_min = right_base_damage.min;
            wd.damage_max = right_base_damage.max;
            wd.crit_damage_min = right_base_damage.crit_min;
            wd.crit_damage_max = right_base_damage.crit_max;
            if(is_attack_left_handed(src, skill_id)) {
                let left_base_damage = battle_calc_base_damage(src, sstatus, sstatus.lhw, tstatus.size, bflag);
                wd.damage2_min = left_base_damage.min;
                wd.damage2_max = left_base_damage.max;
                wd.crit_damage2_min = left_base_damage.crit_min;
                wd.crit_damage2_max = left_base_damage.crit_max;
            }

            if(sd) {
                let skill;

                let crit_atk_rate = sd.bonus.crit_atk_rate;

                if(crit_atk_rate)
                    CRIT_ATK_ADDRATE(wd, src, skill_id, crit_atk_rate);

                if((skill = SkillSearch(SKILL.TK_POWER)) > 0) {
                    ATK_ADDRATE(wd, src, skill_id, 20 + 10 * skill);
                    CRIT_ATK_ADDRATE(wd, src, skill_id, 20 + 10 * skill);
                }
            }

            if(skill_id == SKILL.AM_ACIDTERROR) {
                ATK_ADD(wd, src, skill_id, -tstatus.def2);
                CRIT_ATK_ADD(wd, src, skill_id, -tstatus.def2); 
            }
            break;
    }

    battleDebug && console.log(`[battle_calc_skill_base_damage] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, damage2_min=${wd.damage2_min}, damage2_max=${wd.damage2_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}`);
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 */
function battle_calc_defense_reduction(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_defense_reduction] START â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
    let sd = is_player_object(src) ? src : null;
    let tsd = is_player_object(target) ? target : null;
    let tplayer = is_player_for_battle(target) ? target : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let vit_def_min;
    let vit_def_max;
    let def1 = tstatus.def;

    if(tsd && tsd.active_skill == SKILL.CR_GRANDCROSS)
        def1 -= Math.trunc(def1 * 33 / 100); // 33% def reduced while using grand cross

    let def2 = tstatus.def2;
    battleDebug && console.log(`[battle_calc_defense_reduction] Initial def1=${def1}, def2=${def2}`);

    if(sd) {
        let i = sd.indexed_bonus.ignore_def_by_race[tstatus.race] + sd.indexed_bonus.ignore_def_by_race[RC.ALL];
        i += sd.indexed_bonus.ignore_def_by_class[tstatus.class_] + sd.indexed_bonus.ignore_def_by_class[CLASS.ALL];

        // UMOB_IGNORE_IGNOREDEF
        if(status_has_mode(tstatus, MD.IGNOREIGNOREDEF))
            i = 0;

        if(i) {
            i = Math.min(i, 100);
            def1 -= Math.trunc(def1 * i / 100);
            def2 -= Math.trunc(def2 * i / 100);
        }

        i = 0;

        i = Math.min(i, 100);
        def1 = Math.trunc((def1 * (100 - i)) / 100);
        def2 = Math.trunc((def2 * (100 - i)) / 100);
    }

    if(def2 < 1)
        def2 = 1;

    if(tplayer) {
        let skill;

        vit_def_min = vit_def_max = Math.trunc((3 * def2) / 10);
        vit_def_min += 0;
        vit_def_max += Math.max(0, Math.trunc((def2 * def2) / 150) - Math.trunc((3 * def2) / 10) - 1);
        vit_def_min += Math.trunc(def2 / 2);
        vit_def_max += Math.trunc(def2 / 2);

        if(src.type == BL.MOB && tsd && (battle_check_undead(sstatus.race, sstatus.def_ele) || sstatus.race == RC.DEMON) && (skill = SkillSearch(SKILL.AL_DP)) > 0) {
            vit_def_min += Math.trunc((tsd.status.base_level / 25.0 + 3.0) * skill + 0.5);
            vit_def_max += Math.trunc((tsd.status.base_level / 25.0 + 3.0) * skill + 0.5);
        }
    } else {
        if(!sc_get(target, SC.SKA))
            vit_def_min = vit_def_max = Math.trunc(def2 / 20) * Math.trunc(def2 / 20);
        else
            vit_def_min = vit_def_max = 90;
        battleDebug && console.log("[battle_calc_defense_reduction] Non-player target vit def before swap: vit_def_min=" + vit_def_min + ", vit_def_max=" + vit_def_max);
        // they are swapped since vit_def_min is added to def1 for minimum damage and vit_def_max is added to def1 for maximum damage, so vit_def_min should be the smaller value and vit_def_max should be the larger value
        vit_def_max = def2 + 0;
        vit_def_min = def2 + (vit_def_min > 0 ? vit_def_min - 1 : 0);
    }

    if(def1 > 100) def1 = 100;
    battleDebug && console.log(`[battle_calc_defense_reduction] After reductions â€” def1=${def1}, def2=${def2}, vit_def_min=${vit_def_min}, vit_def_max=${vit_def_max}`);
    ATK_RATE4(wd, src, skill_id, 
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? 100 : (is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) * (def1+vit_def_max) : (100-def1)),
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? 100 : (is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) * (def1+vit_def_min) : (100-def1)),
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? 100 : (is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) * (def1+vit_def_max) : (100-def1)),
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? 100 : (is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) * (def1+vit_def_min) : (100-def1))
    );
    wd.basedamage_min = ATK_RATER(wd.basedamage_min, 100 - def1);
    wd.basedamage_max = ATK_RATER(wd.basedamage_max, 100 - def1);
    ATK_ADD4(wd, src, skill_id,
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_R) || is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? 0 : -vit_def_min,
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_R) || is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_R) ? 0 : -vit_def_max,
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_L) || is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? 0 : -vit_def_min,
        attack_ignores_def(wd, src, target, skill_id, skill_lv, EQI.HAND_L) || is_attack_piercing(wd, src, target, skill_id, skill_lv, EQI.HAND_L) ? 0 : -vit_def_max
    );
    wd.basedamage_min -= vit_def_max;
    wd.basedamage_max -= vit_def_min;

    if(wd.damage_min > wd.damage_max) {
        let tempDamageMax = wd.damage_max;
        wd.damage_max = wd.damage_min;
        wd.damage_min = tempDamageMax;
    }

    battleDebug && console.log(`[battle_calc_defense_reduction] END â€” damage_min=${wd.damage_min}, damage_max=${wd.damage_max}, basedamage_min=${wd.basedamage_min}, basedamage_max=${wd.basedamage_max}, crit_damage_min=${wd.crit_damage_min}, crit_damage_max=${wd.crit_damage_max}, crit_basedamage_min=${wd.crit_basedamage_min}, crit_basedamage_max=${wd.crit_basedamage_max}`);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {StatusData} status 
 * @param {WeaponATK} wa 
 * @param {number} t_size 
 * @param {number} flag 
 * @returns 
 */
function battle_calc_base_damage(src, status, wa, t_size, flag) {
    battleDebug && console.log(`[battle_calc_base_damage] START â€” wa.atk=${wa.atk}, wa.atk2=${wa.atk2}, t_size=${t_size}, flag=${flag}`);
    let atkmin = 0, atkmax = 0;
    let type = 0;
    let damage_min = 0, damage_max = 0;
    let crit_damage_min = 0, crit_damage_max = 0;
    let sd = is_player_object(src) ? src : null;

    if(!sd) {
        if(flag & BDMG.MAGIC) {
            atkmin = status.matk_min;
            atkmax = status.matk_max;
        } else {
            atkmin = wa.atk;
            atkmax = wa.atk2;
        }
        battleDebug && console.log(`[battle_calc_base_damage] MOB path â€” atkmin=${atkmin}, atkmax=${atkmax}`);
        if(atkmin > atkmax)
            atkmin = atkmax;

        if(sc_get(src, SC.MAXIMIZEPOWER)) // maximize power
            atkmin = atkmax;
        battleDebug && console.log(`[battle_calc_base_damage] MOB after maximize power check â€” atkmin=${atkmin}, atkmax=${atkmax}`);
    } else {
        atkmax = wa.atk;
        type = (wa == status.lhw) ? EQI.HAND_L : EQI.HAND_R;

        atkmin = status.dex;
        battleDebug && console.log(`[battle_calc_base_damage] PC path â€” atkmax(wa.atk)=${atkmax}, atkmin(dex)=${atkmin}, type=${type}, equip[type]=${sd.equip[type]}`);

        if(sd.equip[type] >= 0)
            atkmin = Math.trunc(atkmin * (80 + (type == EQI.HAND_R ? sd.right_weapon.level : sd.left_weapon.level) * 20) / 100);
        battleDebug && console.log(`[battle_calc_base_damage] weapon level=${type == EQI.HAND_R ? sd.right_weapon.level : sd.left_weapon.level}, dex_rate=${80 + (type == EQI.HAND_R ? sd.right_weapon.level : sd.left_weapon.level) * 20}`);
        battleDebug && console.log(`[battle_calc_base_damage] after weapon level scaling â€” atkmin=${atkmin}, atkmax=${atkmax}`);

        if(atkmin > atkmax)
            atkmin = atkmax;

        if(flag&BDMG.ARROW) {
            battleDebug && console.log(`[battle_calc_base_damage] ARROW â€” atkmin before=${atkmin}, atkmin*atkmax/100=${Math.trunc(atkmin*atkmax/100)}`);
            atkmin = Math.trunc(atkmin*atkmax/100);
            if(atkmin > atkmax)
                atkmax = atkmin;
        }

        if(SkillSearch(SKILL.BS_MAXIMIZE)) {
            battleDebug && console.log(`[battle_calc_base_damage] BS_MAXIMIZE active â€” atkmin set to atkmax=${atkmax}`);
            atkmin = atkmax;
        }
        battleDebug && console.log(`[battle_calc_base_damage] final atkmin=${atkmin}, atkmax=${atkmax}`);
    }

    damage_min = atkmin;
    damage_max = atkmax > atkmin ? atkmax - 1 : atkmin;

    crit_damage_min = crit_damage_max = atkmax;
    battleDebug && console.log(`[battle_calc_base_damage] initial damage â€” damage_min=${damage_min}, damage_max=${damage_max}, crit_damage_min=${crit_damage_min}, crit_damage_max=${crit_damage_max}`);

    if(sd) {
        if(flag&BDMG.ARROW && sd.bonus.arrow_atk) {
            battleDebug && console.log(`[battle_calc_base_damage] arrow_atk=${sd.bonus.arrow_atk}, weapon=${sd.status.weapon}, isGun=${sd.status.weapon >= WEAPON.REVOLVER && sd.status.weapon <= WEAPON.GRENADE}`);
            damage_min += 0;
            damage_max += sd.bonus.arrow_atk - 1;

            // crits with guns are treated as melee attacks instead of ranged attacks, so they dont get the benefit from arrow atk bonuses
            if(!(sd.status.weapon >= WEAPON.REVOLVER && sd.status.weapon <= WEAPON.GRENADE)) {
                crit_damage_min += sd.bonus.arrow_atk;
                crit_damage_max += sd.bonus.arrow_atk;
            }
            battleDebug && console.log(`[battle_calc_base_damage] after arrow_atk â€” damage_min=${damage_min}, damage_max=${damage_max}, crit_damage_min=${crit_damage_min}, crit_damage_max=${crit_damage_max}`);
        }

        if(!(sd.special_state.no_sizefix || (flag&BDMG.NOSIZE))) {
            damage_min = Math.trunc(damage_min * ((type == EQI.HAND_R ? sd.right_weapon.atkmods[t_size] : sd.left_weapon.atkmods[t_size])) / 100);
            damage_max = Math.trunc(damage_max * ((type == EQI.HAND_R ? sd.right_weapon.atkmods[t_size] : sd.left_weapon.atkmods[t_size])) / 100);
            crit_damage_min = Math.trunc(crit_damage_min * ((type == EQI.HAND_R ? sd.right_weapon.atkmods[t_size] : sd.left_weapon.atkmods[t_size])) / 100);
            crit_damage_max = Math.trunc(crit_damage_max * ((type == EQI.HAND_R ? sd.right_weapon.atkmods[t_size] : sd.left_weapon.atkmods[t_size])) / 100);
            battleDebug && console.log(`[battle_calc_base_damage] after size penalty â€” damage_min=${damage_min}, damage_max=${damage_max}, crit_damage_min=${crit_damage_min}, crit_damage_max=${crit_damage_max}`);
        }
    }

    if(flag&BDMG.MAGIC) {
        battleDebug && console.log(`[battle_calc_base_damage] adding matk_min=${status.matk_min}`);
        damage_min += status.matk_min;
        damage_max += status.matk_min;
        crit_damage_min += status.matk_min;
        crit_damage_max += status.matk_min;
    }
    else if(sd) {
        battleDebug && console.log(`[battle_calc_base_damage] adding batk=${status.batk}`);
        damage_min += status.batk;
        damage_max += status.batk;
        crit_damage_min += status.batk;
        crit_damage_max += status.batk;
    }
    battleDebug && console.log(`[battle_calc_base_damage] after batk/matk â€” damage_min=${damage_min}, damage_max=${damage_max}, crit_damage_min=${crit_damage_min}, crit_damage_max=${crit_damage_max}`);

    if(sd) {
        let weapon_damage = battle_add_weapon_damage(src, damage_min, damage_max, type);
        battleDebug && console.log(`[battle_calc_base_damage] weapon_damage result â€” min=${weapon_damage.min}, max=${weapon_damage.max}`);
        damage_min = weapon_damage.min;
        damage_max = weapon_damage.max;
        let crit_weapon_damage = battle_add_weapon_damage(src, crit_damage_min, crit_damage_max, type);
        battleDebug && console.log(`[battle_calc_base_damage] crit_weapon_damage result â€” min=${crit_weapon_damage.min}, max=${crit_weapon_damage.max}`);
        crit_damage_min = crit_weapon_damage.min;
        crit_damage_max = crit_weapon_damage.max;
    }

    battleDebug && console.log(`[battle_calc_base_damage] END â€” damage_min=${damage_min}, damage_max=${damage_max}, crit_damage_min=${crit_damage_min}, crit_damage_max=${crit_damage_max}`);
    return {min: damage_min, max: damage_max, crit_min: crit_damage_min, crit_max: crit_damage_max};
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {number} damage_min 
 * @param {number} damage_max 
 * @param {number} type 
 * @returns 
 */
function battle_add_weapon_damage(src, damage_min, damage_max, type) {
    battleDebug && console.log(`[battle_add_weapon_damage] START â€” damage_min=${damage_min}, damage_max=${damage_max}, type=${type}`);
    let overrefine_bonus = 0;
    let sd = is_player_object(src) ? src : null;
    if(!sd)
        return {min: damage_min, max: damage_max};

    let weapon_lv = type == EQI.HAND_R ? sd.right_weapon.level : sd.left_weapon.level;
    let weapon_refine = type == EQI.HAND_R ? sd.right_weapon.refine : sd.left_weapon.refine;

    switch(weapon_lv) {
        case 1:
            overrefine_bonus = weapon_refine >= 8 ? 3 * (weapon_refine - 7) : 0;
            break;
        case 2:
            overrefine_bonus = weapon_refine >= 7 ? 5 * (weapon_refine - 6) : 0;
            break;
        case 3:
            overrefine_bonus = weapon_refine >= 6 ? 8 * (weapon_refine - 5) : 0;
            break;
        case 4:
            overrefine_bonus = weapon_refine >= 5 ? 13 * (weapon_refine - 4) : 0;
            break;
    }

    damage_min += 0;
    damage_max += overrefine_bonus;

    battleDebug && console.log(`[battle_add_weapon_damage] END â€” overrefine_bonus=${overrefine_bonus}, damage_min=${damage_min}, damage_max=${damage_max}`);
    return {min: damage_min, max: damage_max};
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {number} wflag 
 * @returns 
 */
function initialize_weapon_data(src, target, skill_id, skill_lv, wflag) {
    battleDebug && console.log(`[initialize_weapon_data] START â€” skill_id=${skill_id}, skill_lv=${skill_lv}, wflag=${wflag}`);
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let sd = is_player_object(src) ? src : null;
    let wd = new Damage();

    wd.type = DMG.NORMAL;
    wd.div_ = skill_id ? skill_get_num(src, skill_id, skill_lv) : 1;
    wd.miscflag = wflag;
    wd.flag = BF.WEAPON;
    wd.flag |= (skill_id || wd.miscflag) ? BF.SKILL : BF.NORMAL;
    wd.isspdamage = false;
    wd.damage_min = wd.damage2_min = wd.basedamage_min = 0;
    wd.damage_max = wd.damage2_max = wd.basedamage_max = 0;
    wd.dmg_lv = ATK.DEF;

    if(skill_id) {
        wd.flag |= battle_range_type(src, target, skill_id, skill_lv);

        switch(skill_id) {
            case SKILL.RG_BACKSTAP:
                if(sd && sd.status.weapon == WEAPON.DAGGER)
                    wd.div_ = 2;
                break;
            
            case SKILL.MO_FINGEROFFENSIVE:
                if(sd) {
                    if(sd.spiritball < wd.div_)
                        wd.div_ = sd.spiritball;
                }
                break;

            case SKILL.KN_PIERCE:
                wd.div_ = wd.div_ > 0 ? tstatus.size + 1 : -(tstatus.size + 1);
                break;
            
            case SKILL.LK_SPIRALPIERCE:
                if(!sd) wd.flag = (wd.flag & ~(BF.RANGEMASK|BF.WEAPONMASK))|BF.LONG|BF.MISC;
                break;
        }
    } else {
        let is_long = false;

        if(is_skill_using_arrow(src, skill_id))
            is_long = true;
        wd.flag |= is_long ? BF.LONG : BF.SHORT;
    }

    battleDebug && console.log(`[initialize_weapon_data] END â€” div_=${wd.div_}, flag=${wd.flag}, type=${wd.type}`);
    return wd;
}

/**
 * Calculate multi-attack (double attack, chain action, etc.)
 * Stores the proc rate in wd.multi_attack_rate for DPS calculation
 * 
 * @param {Damage} wd - Weapon damage struct (modified in place)
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {PlayerData|MonsterData} target - Target
 * @param {number} skill_id - Skill ID
 * @param {number} skill_lv - Skill level
 */
function battle_calc_multi_attack(wd, src, target, skill_id, skill_lv) {
    battleDebug && console.log(`[battle_calc_multi_attack] START â€” skill_id=${skill_id}, div_=${wd.div_}`);
    let sd = is_player_object(src) ? src : null;
    let tstatus = status_get_status_data(target);

    if(sd && !skill_id) {
        let chain_rate = 5;
        let double_attack_rate = 0;
        
        // Chain Action check
        if((skill_lv = SkillSearch(SKILL.GS_CHAINACTION)) > 0) {
            chain_rate = chain_rate * skill_lv;
        }
        
        // Double Attack check
        if(wd.div_ == 1 && (((skill_lv = SkillSearch(SKILL.TF_DOUBLE)) > 0) && sd.weapontype1 == WEAPON.DAGGER)
            || (sd.bonus.double_rate > 0 && sd.weapontype1 != WEAPON.FIST)
            || check_double_attack(src) > 0 && sd.weapontype1 != WEAPON.FIST)
        {
            if(skill_lv < check_double_attack(src))
                skill_lv = check_double_attack(src);
            double_attack_rate = Math.max(5 * skill_lv, sd.bonus.double_rate);
            double_attack_rate += sd.bonus.double_add_rate;

            if(double_attack_rate > 0) {
                wd.div_ = skill_get_num(src, SKILL.TF_DOUBLE, skill_lv ? skill_lv : 1);
                wd.type = DMG.MULTI_HIT;
                wd.multi_attack_rate = double_attack_rate; // Store for DPS calc
            }
        }
        
        // Chain Action proc
        if(wd.div_ == 1 && (skill_lv = SkillSearch(SKILL.GS_CHAINACTION) > 0) && chain_rate > 0) {
            wd.div_ = skill_get_num(src, SKILL.GS_CHAINACTION, skill_lv);
            wd.type = DMG.MULTI_HIT;
            wd.multi_attack_rate = chain_rate; // Store for DPS calc
        }
    }

    switch(skill_id) {
    }
    battleDebug && console.log(`[battle_calc_multi_attack] END â€” div_=${wd.div_}, type=${wd.type}, multi_attack_rate=${wd.multi_attack_rate}`);
}

/**
 * 
 * @param {PlayerData} src 
 * @returns 
 */
function check_double_attack(src) {
    let double_attack_lv = 0;
    if(src.type == BL.PC) {
        if(CardNumSearch(43))
            double_attack_lv = 1;
        if(player.equip[EQI.HEAD_TOP] == 570)
            double_attack_lv = 2;
        if(player.equip[EQI.HEAD_TOP] == 1321)
            double_attack_lv = 5;
        if(player.equip[EQI.HAND_R] == 1909)
            double_attack_lv = 5;
    }
    return double_attack_lv;
}

/**
 * 
 * @param {PlayerData} src 
 * @param {number} skill_id 
 * @returns 
 */
function pc_skillatk_bonus(src, skill_id) {
    let bonus = 0;

    for(let it of player.skillatk) {
        if(it.id == skill_id) {
            bonus += it.val;
            break;
        }
    }

    return bonus;
}

/**
 * 
 * @param {PlayerData} src 
 * @param {number} skill_id 
 * @returns 
 */
function pc_sub_skillatk_bonus(src, skill_id) {
    let bonus = 0;

    for(let it of player.subskill) {
        if(it.id == skill_id) {
            bonus += it.val;
            break;
        }
    }

    return bonus;
}

/**
 * 
 * @param {PlayerData} sd 
 * @param {number} skill_id 
 * @returns 
 */
function pc_skillheal_bonus(sd, skill_id) {
    let bonus = player.bonus.add_heal_rate;

    if(bonus) {
        switch(skill_id) {
            case SKILL.BA_APPLEIDUN: bonus = 0; break;
        }
    }

    for(let it of player.skillheal) {
        if(it.id == skill_id) {
            bonus += it.val;
            break;
        }
    }

    return bonus;
}

/**
 * 
 * @param {PlayerData} sd 
 * @param {number} skill_id 
 * @returns 
 */
function pc_skillheal2_bonus(sd, skill_id) {
    let bonus = player.bonus.add_heal2_rate;

    for(let it of player.skillheal2) {
        if(it.id == skill_id) {
            bonus += it.val;
            break;
        }
    }
    
    return bonus;
}

/**
 * 
 * @param {RC} race 
 * @param {ELE} element 
 * @returns 
 */
function battle_check_undead(race, element) {
    if(element == ELE.UNDEAD)
        return 1;

    return 0;
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @returns 
 */
function battle_get_atkpercent(src, skill_id) {
    battleDebug && console.log(`[battle_get_atkpercent] START skill_id=${skill_id}`);
    let sd = is_player_object(src) ? src : null;
    if(sd && !battle_skill_stacks_masteries_vvs(skill_id, BCHK.ALL))
        return 100;

    let atkpercent = 100;

    if(sd) {
        if(sc_get(src, SC.CURSE)) // curse
            atkpercent -= 25;
        if(SkillSearch(SKILL.SM_AUTOBERSERK) || sc_get(src, SC.PROVOKE) || sc_get(src, SC.ALOEVERA)) { // provoke
            let skill_lv = 1;
            if(SkillSearch(SKILL.SM_AUTOBERSERK))
                skill_lv = 10;
            else if(sc_get(src, SC.PROVOKE))
                skill_lv = sc_get(src, SC.PROVOKE).val1;
            atkpercent += 2 + 3 * skill_lv;
        }
        if(SkillSearch(SKILL.LK_CONCENTRATION))
            atkpercent += 5 * SkillSearch(SKILL.LK_CONCENTRATION);
        if(SkillSearch(SKILL.SN_SIGHT))
            atkpercent += 2 * SkillSearch(SKILL.SN_SIGHT);
        if(sc_get(src, SC.INCATKRATE)) // gospel atk%
            atkpercent += sc_get(src, SC.INCATKRATE).val1;
    }

    if(!sd) {
        if(sc_get(src, SC.CURSE)) // curse enemy
            atkpercent -= 25;
        if(sc_get(src, SC.PROVOKE))
            atkpercent += sc_get(src, SC.PROVOKE).val2; // monster provoke debuff
        if(sc_get(src, SC.STRIPWEAPON))
            atkpercent -= 25;
        if(sc_get(src, SC.POWERUP)) // power up
            atkpercent += 200;
        if(sc_get(src, SC.SKE)) // eske
            atkpercent += 300;
    }

    battleDebug && console.log(`[battle_get_atkpercent] END â€” atkpercent=${atkpercent}`);
    return cap_value(atkpercent, 0, USHRT_MAX);
}

/**
 * 
 * @param {number} skill_id 
 * @param {BCHK} chk_flag 
 * @returns 
 */
function battle_skill_stacks_masteries_vvs(skill_id, chk_flag) {
    switch(skill_id) {
        case SKILL.PA_SHIELDCHAIN:
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
        case SKILL.AM_ACIDTERROR:
        case SKILL.MO_INVESTIGATE:
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
        case SKILL.PA_SACRIFICE:
            return false;
        case SKILL.LK_SPIRALPIERCE:
            if(chk_flag != BCHK.REFINE && chk_flag != BCHK.STAR)
                return false;
            break;
    }

    return true;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {number} weapon_position 
 * @returns 
 */
function battle_get_weapon_element(wd, src, target, skill_id, skill_lv, weapon_position) {
    let sd = is_player_object(src) ? src : null;
    let sstatus = status_get_status_data(src);
    let element = skill_get_ele(skill_id, skill_lv);

    if(!skill_id || element == ELE.WEAPON) {
        element = sstatus.rhw.ele;

        if(is_skill_using_arrow(src, skill_id) && sd && sd.bonus.arrow_ele && weapon_position == EQI.HAND_R && (1 * c.A_Weapon_element.value == 0)) 
            element = sd.bonus.arrow_ele;
    }

    switch(skill_id) {
        case SKILL.LK_SPIRALPIERCE:
            if(!sd)
                element = ELE.NEUTRAL;
            break;
    }

    return element; 
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function battle_range_type(src, target, skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.WZ_FIREPILLAR:
        case SKILL.HT_SKIDTRAP:
        case SKILL.HT_LANDMINE:
        case SKILL.HT_ANKLESNARE:
        case SKILL.HT_FLASHER:
        case SKILL.HT_SHOCKWAVE:
        case SKILL.HT_SANDMAN:
        case SKILL.HT_FREEZINGTRAP:
        case SKILL.HT_BLASTMINE:
        case SKILL.HT_CLAYMORETRAP:
        case SKILL.HT_TALKIEBOX:
            return BF.SHORT;
    }

    switch(skill_id) {
        case SKILL.AC_SHOWER:
        case SKILL.AM_DEMONSTRATION:
            if(src.type == BL.MOB)
                return BF.SHORT;
            break;
        
        case SKILL.NJ_KIRIKAGE:
            return BF.SHORT;
    }

    if(src.type == BL.MOB) {
        if(c.B_AtkRange.value == 1)
            return BF.SHORT;
        else if(c.B_AtkRange.value == 2)
            return BF.LONG;
    }

    if(skill_get_range2(src, skill_id, skill_lv) < 4)
        return BF.SHORT;
    return BF.LONG;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {EQI} weapon_position
 * @returns 
 */
function attack_ignores_def(wd, src, target, skill_id, skill_lv, weapon_position) {
    let tstatus = status_get_status_data(target);
    let sd = is_player_object(src) ? src : null;

    // UMOB_IGNORE_IGNOREDEF
    if(status_has_mode(tstatus, MD.IGNOREIGNOREDEF))
        return false;

    if(SkillSearch(SKILL.SG_FUSION))
        return true;

    if(sd && skill_id != SKILL.CR_GRANDCROSS && skill_id != SKILL.NPC_GRANDDARKNESS) {
        if(sd.indexed_bonus.ignore_def_ele[tstatus.def_ele] > 0 || sd.indexed_bonus.ignore_def_ele[ELE.MAX] > 0 || 
            sd.indexed_bonus.ignore_def_race[tstatus.race] > 0 || sd.indexed_bonus.ignore_def_race[RC.ALL] > 0 || 
            sd.indexed_bonus.ignore_def_class[tstatus.class_] > 0 || sd.indexed_bonus.ignore_def_class[CLASS.ALL] > 0)
            return true;
    }

    return skill_ignores_def(skill_id);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @returns 
 */
function is_skill_using_arrow(src, skill_id) {
    let sd = is_player_object(src) ? src : null;

    if(sd) {
        if(sd.bonus.arrow_atk > 0)
            return true;
    } else {
        let sstatus = status_get_status_data(src);

        if(sstatus && sstatus.rhw.range > 3) {
            return true;
        }
    }

    switch(skill_id) {
        case SKILL.HT_FREEZINGTRAP:
        case SKILL.HT_PHANTASMIC:
        case SKILL.GS_GROUNDDRIFT:
            return true;
    }

    return false;
}

/**
 * Calculate critical hit chance and determine if attack can crit
 * Stores the crit rate in wd.crit_rate for DPS calculation
 * 
 * @param {Damage} wd - Weapon damage struct
 * @param {PlayerData|MonsterData} src - Attacker
 * @param {PlayerData|MonsterData} target - Target
 * @param {number} skill_id - Skill ID
 * @param {number} skill_lv - Skill level
 * @param {boolean} first_call - True if this is the initial check, false if checking existing flag
 * @returns {boolean} True if this attack can/will crit
 */
function is_attack_critical(wd, src, target, skill_id, skill_lv, first_call) {
    if(!first_call)
        return wd.crit_rate > 0;

    battleDebug && console.log(`[is_attack_critical] START â€” skill_id=${skill_id}, skill_lv=${skill_lv}`);

    // Forced critical skills
    if(skill_id == SKILL.NPC_CRITICALSLASH) {
        battleDebug && console.log(`[is_attack_critical] NPC_CRITICALSLASH â€” forced crit`);
        wd.crit_rate = 1000;
        return true;
    }

    if(src.type == BL.PC && SkillSearch(SKILL.SG_FUSION)) {
        wd.crit_rate = 1000;
        return true;
    }

    if(skill_id && !skill_can_crit(skill_id)) {
        battleDebug && console.log(`[is_attack_critical] skill ${skill_id} cannot crit`);
        wd.crit_rate = 0;
        return false;
    }

    let sstatus = status_get_status_data(src);
    let sd = is_player_object(src) ? src : null;

    if(sd && sstatus.cri) {
        // Multi-hit attacks from these skills cannot crit
        if(wd.type == DMG.MULTI_HIT) {
            // still calculate for display purposes and since u technically still can crit, if the double attack doesnt proc
            if(SkillSearch(SKILL.GS_CHAINACTION) && !skill_can_crit(SKILL.GS_CHAINACTION)) {
                battleDebug && console.log(`[is_attack_critical] GS_CHAINACTION multi-hit â€” no crit`);
                //wd.crit_rate = 0;
                //return false;
            }
            if(SkillSearch(SKILL.TF_DOUBLE) && !skill_can_crit(SKILL.TF_DOUBLE)) {
                battleDebug && console.log(`[is_attack_critical] TF_DOUBLE multi-hit â€” no crit`);
                //wd.crit_rate = 0;
                //return false;
            }
        }

        let tstatus = status_get_status_data(target);
        let tsd = is_player_for_battle(target) ? target : null;

        let cri = sstatus.cri;
        let tluk = tstatus.luk;
        battleDebug && console.log(`[is_attack_critical] base cri=${cri}, target luk=${tluk}`);

        cri += sd.indexed_bonus.critaddrace[tstatus.race] + sd.indexed_bonus.critaddrace[RC.ALL];
        battleDebug && console.log(`[is_attack_critical] after critaddrace â€” cri=${cri} (race[${tstatus.race}]=${sd.indexed_bonus.critaddrace[tstatus.race]}, race[ALL]=${sd.indexed_bonus.critaddrace[RC.ALL]})`);
        if(!skill_id && is_skill_using_arrow(src, skill_id)) {
            cri += sd.bonus.arrow_cri;
            cri += sd.bonus.critical_rangeatk;
            battleDebug && console.log(`[is_attack_critical] arrow cri bonuses â€” arrow_cri=${sd.bonus.arrow_cri}, critical_rangeatk=${sd.bonus.critical_rangeatk}, cri=${cri}`);
        }

        tluk = cap_value(tluk, 0, SHRT_MAX);

        let luk_reduction = tluk * ((!sd && tsd) ? 3 : 2);
        cri -= luk_reduction;
        battleDebug && console.log(`[is_attack_critical] after luk reduction â€” tluk=${tluk}, multiplier=${(!sd && tsd) ? 3 : 2}, luk_reduction=${luk_reduction}, cri=${cri}`);

        // sleep debuff
        if(sc_get(target, SC.SLEEP)) {
            cri *= 2;
            battleDebug && console.log(`[is_attack_critical] sleep debuff â€” cri doubled to ${cri}`);
        }

        switch(skill_id) {
            case SKILL.SN_SHARPSHOOTING:
                cri += 200;
                battleDebug && console.log(`[is_attack_critical] SN_SHARPSHOOTING +200 â€” cri=${cri}`);
                break;
            case SKILL.NJ_KIRIKAGE:
                cri += 250 + 50 * skill_lv;
                battleDebug && console.log(`[is_attack_critical] NJ_KIRIKAGE +${250 + 50 * skill_lv} â€” cri=${cri}`);
                break;
        }

        // Store the calculated crit rate for DPS calculation
        wd.crit_rate = Math.max(0, Math.min(1000, cri)); // Convert to percentage and cap 0-100
        
        battleDebug && console.log(`[is_attack_critical] END â€” final cri=${cri}, crit_rate=${wd.crit_rate}, is_crit=${cri > 0}`);
        return cri > 0;
    }

    battleDebug && console.log(`[is_attack_critical] No crit (no sd or no base cri) â€” sstatus.cri=${sstatus?.cri}`);
    wd.crit_rate = 0;
    return false;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {boolean} first_call 
 * @returns 
 */
function is_attack_hitting(wd, src, target, skill_id, skill_lv, first_call) {
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);
    let sd = is_player_object(src) ? src : null;
    let md = is_monster_object(src) ? src : null;
    let dstmd = is_monster_object(target) ? target : null;
    let flee, hitrate;

    if(!first_call)
        return wd.hit_rate > 0;
    if(sd && sd.bonus.perfect_hit > 0) { // perfect hit
        wd.hit_rate = 100;
        return true;
    } else if(sd && SkillSearch(SKILL.SG_FUSION)) {
        wd.hit_rate = 100;
        return true;
    } else if(skill_id == SKILL.CR_SHIELDBOOMERANG_SL) {
        wd.hit_rate = 100;
        return true;
    }
    else if(sc_get(target, SC.STUN) || sc_get(target, SC.FREEZE) || sc_get(target, SC.SLEEP) || sc_get(target, SC.STONE)) { // stun, freeze, petrify, sleep statuses
        wd.hit_rate = 100;
        return true;
    }
    else if(skill_ignore_flee(skill_id)) {
        wd.hit_rate = 100;
        return true;
    }

    flee = tstatus.flee;
    hitrate = 80;

    hitrate += sstatus.hit - flee;

    if(md && (wd.flag&(BF.LONG|BF.MAGIC)) == BF.LONG && !skill_id && sc_get(target, SC.FOGWALL)) // if target is in fog reduce hit rate by 50
        hitrate -= 50;

    if(sd && is_skill_using_arrow(src, skill_id))
        hitrate += sd.bonus.arrow_hit;
    
    if(skill_id) {
        switch(skill_id) {
            case SKILL.SM_BASH:
                hitrate += Math.trunc(hitrate * 5 * skill_lv / 100);
                break;
            case SKILL.SM_MAGNUM:
                hitrate += Math.trunc(hitrate * 10 * skill_lv / 100);
                break;
            case SKILL.NPC_WATERATTACK:
            case SKILL.NPC_GROUNDATTACK:
            case SKILL.NPC_FIREATTACK:
            case SKILL.NPC_WINDATTACK:
            case SKILL.NPC_POISONATTACK:
            case SKILL.NPC_HOLYATTACK:
            case SKILL.NPC_DARKNESSATTACK:
            case SKILL.NPC_TELEKINESISATTACK:
            case SKILL.NPC_UNDEADATTACK:
            case SKILL.NPC_POISON:
            case SKILL.NPC_BLINDATTACK:
            case SKILL.NPC_SILENCEATTACK:
            case SKILL.NPC_STUNATTACK:
            case SKILL.NPC_PETRIFYATTACK:
            case SKILL.NPC_CURSEATTACK:
            case SKILL.NPC_SLEEPATTACK:
            case SKILL.NPC_BLEEDING:
                hitrate += Math.trunc(hitrate * 20 / 100);
                break;
            case SKILL.NPC_FIREBREATH_MELEE:
            case SKILL.NPC_FIREBREATH_RANGED:
            case SKILL.NPC_ICEBREATH_MELEE:
            case SKILL.NPC_ICEBREATH_RANGED:
            case SKILL.NPC_THUNDERBREATH_MELEE:
            case SKILL.NPC_THUNDERBREATH_RANGED:
            case SKILL.NPC_ACIDBREATH_MELEE:
            case SKILL.NPC_ACIDBREATH_RANGED:
            case SKILL.NPC_DARKNESSBREATH_MELEE:
            case SKILL.NPC_DARKNESSBREATH_RANGED:
                hitrate *= 2;
                break;
            case SKILL.KN_PIERCE:
                hitrate += Math.trunc(hitrate * 5 * skill_lv / 100);
                break;
            case SKILL.AS_SONICBLOW:
            case SKILL.AS_SONICBLOW_SL:
                if(sd && SkillSearch(SKILL.AS_SONICACCEL) > 0)
                    hitrate += Math.trunc(hitrate * 50 / 100);
                break;
        }
    }else if(sd && wd.type == DMG.MULTI_HIT && wd.div_ == 2)
        hitrate += SkillSearch(SKILL.TF_DOUBLE);
    
    if(sd) {
        if(SkillSearch(SKILL.BS_WEAPONRESEARCH) > 0)
            hitrate += Math.trunc(hitrate * (2 * SkillSearch(SKILL.BS_WEAPONRESEARCH)) / 100);
    }

    hitrate = cap_value(hitrate, 5, 100);

    if(skill_id == SKILL.PA_SHIELDCHAIN)
        hitrate += 20;

    // Store the calculated hit rate for DPS calculation
    wd.hit_rate = hitrate;

    return hitrate > 0;
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} flag 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function is_infinite_defense(src, target, flag, skill_id, skill_lv) {
    let tstatus = status_get_status_data(target);
    let md = is_monster_object(target) ? target : null;

    if(md) {
        if(status_has_mode(tstatus, MD.IGNOREMELEE) && (flag&(BF.WEAPON|BF.SHORT)) == (BF.WEAPON|BF.SHORT)) // no melee damage
            return true;
        if(status_has_mode(tstatus, MD.IGNORERANGED) && (flag&(BF.WEAPON|BF.LONG)) == (BF.WEAPON|BF.LONG)) // no ranged damage
            return true;
        if(status_has_mode(tstatus, MD.IGNOREMAGIC) && flag&(BF.MAGIC)) // no magic damage
            return true;
        if(status_has_mode(tstatus, MD.IGNOREMISC) && flag&(BF.MISC)) // no misc damage
            return true;
    }

    return false;
}

/**
 * 
 * @param {Damage} wd 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {number} weapon_position 
 * @returns 
 */
function is_attack_piercing(wd, src, target, skill_id, skill_lv, weapon_position) {
    let tstatus = status_get_status_data(target);
    
    if(status_has_mode(tstatus, MD.IGNOREPIERCEATK))
        return 0;

    if(skill_id == SKILL.MO_INVESTIGATE)
        return 2;

    if(src) {
        let sd = is_player_object(src) ? src : null;
        let tstatus = status_get_status_data(target);

        if(sd && skill_id != SKILL.CR_GRANDCROSS && skill_id != SKILL.NPC_GRANDDARKNESS && skill_id != SKILL.PA_SHIELDCHAIN && !is_attack_critical(wd, src, target, skill_id, skill_lv, false)) {
            if(sd.indexed_bonus.def_ratio_atk_ele[tstatus.def_ele] > 0 || sd.indexed_bonus.def_ratio_atk_ele[ELE.MAX] > 0 ||
                sd.indexed_bonus.def_ratio_atk_race[tstatus.race] > 0 || sd.indexed_bonus.def_ratio_atk_race[RC.ALL] > 0 ||
                sd.indexed_bonus.def_ratio_atk_class[tstatus.class_] > 0 || sd.indexed_bonus.def_ratio_atk_class[CLASS.ALL] > 0)
                return 1;
        }
    }

    return 0;
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {PlayerData|MonsterData} target 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @param {boolean} heal 
 * @param {boolean} display 
 * @returns 
 */
function skill_calc_heal(src, target, skill_id, skill_lv, heal, display = true) {
    let skill, hp = 0;

    let sd = is_player_object(src) ? src : null;
    let tsd = is_player_object(target) ? target : null;
    let sstatus = status_get_status_data(src);
    let tstatus = status_get_status_data(target);

    switch(skill_id) {
        case SKILL.BA_APPLEIDUN:
            hp = 30 + 5 * skill_lv + Math.trunc(sstatus.vit / 2);
            hp += 5 * SkillSearch(SKILL.BA_MUSICALLESSON);
            break;
        case SKILL.PR_SANCTUARY:
            hp = (skill_lv > 6) ? 777 : skill_lv * 100;
            break;
        case SKILL.NPC_EVILLAND:
            hp = (skill_lv > 6) ? 666 : skill_lv * 100;
            break;
        default:
            hp = Math.trunc((sd.status.base_level + sstatus.int) / 8) * (4 + (skill_lv * 8));
            if((skill = SkillSearch(SKILL.HP_MEDIATIO)) > 0)
                hp += Math.trunc((hp * skill * 2) / 100);
            break;
    }

    if(!heal && skill_id != SKILL.NPC_EVILLAND)
        hp = Math.trunc(hp / 2);

    if(sd) {
        if((skill = SkillSearch(SKILL.NV_BREAKTHROUGH)) > 0)
            hp += Math.trunc((hp * 10) / 100);

        if(skill = pc_skillheal_bonus(sd, skill_id))
            hp += Math.trunc((hp * skill) / 100);
    }

    if(display && tsd && (skill = pc_skillheal2_bonus(tsd, skill_id)))
        hp += Math.trunc((hp * skill) / 100);

    if(tsd) {
        if(skill_id != SKILL.NPC_EVILLAND && skill_id != SKILL.BA_APPLEIDUN) {
            if(sc_get(target, SC.INCHEALRATE)) { // regeneration potion
                let bonus = sc_get(target, SC.INCHEALRATE) ? sc_get(target, SC.INCHEALRATE).val1 : 0;
                hp += Math.trunc((hp * bonus) / 100);
            }
        }
    }

    if(heal && tsd) {
        let penalty = 0;
        if(sc_get(target, SC.CRITICALWOUND)) // critical wounds
            penalty += sc_get(target, SC.CRITICALWOUND).val2;
        if(penalty > 0)
            hp -= Math.trunc((hp * penalty) / 100);
    }

    return hp;
}

/**
 * 
 * @param {PlayerData} src 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_castfix(src, skill_id, skill_lv) {
    let time = skill_get_cast(skill_id, skill_lv);
    let reduce_cast_rate = 0;
    let flag = skill_get_castnodex(skill_id);

    if(!flag) {
        let scale = 150 - player.battle_status.dex;

        if(scale > 0)
            time = time * scale / 150;
        else
            return 0;
    }

    if(player.castrate != 100)
        reduce_cast_rate += 100 - player.castrate;
    if(player.bonus.add_varcast != 0)
        time += player.bonus.add_varcast;

    for(let it of player.skillcastrate) {
        if(it.id == skill_id) {
            time += time * it.val / 100;
            break;
        }
    }
    for(let it of player.skillvarcast) {
        if(it.id == skill_id) {
            time += it.val;
            break;
        }
    }
    
    if(sc_get(player, SC.POEMBRAGI)) { // bragi
        reduce_cast_rate += sc_get(player, SC.POEMBRAGI).val5;
    }

    if(SkillSearch(SKILL.PF_MEMORIZE))
        time -= time * 50 / 100;

    time = time * (1 - reduce_cast_rate / 100);

    time = Math.max(Math.trunc(time), 0);

    if(sc_get(player, SC.SUFFRAGIUM)) {
        let reduction = 0;
        if(sc_get(player, SC.SUFFRAGIUM))
            reduction += sc_get(player, SC.SUFFRAGIUM).val2;

        time -= Math.floor((time * reduction) / 100);
    }

    if(time < skill_get_fix_cast(skill_id, skill_lv))
        time = skill_get_fix_cast(skill_id, skill_lv);

    return Math.trunc(time);
}

/**
 * 
 * @param {PlayerData} src 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_delayfix(src, skill_id, skill_lv) {
    let time = skill_get_delay(skill_id, skill_lv);

    if(time < 0)
        time = -time + player.battle_status.amotion;

    switch(skill_id) {
        case SKILL.MO_TRIPLEATTACK:
        case SKILL.MO_CHAINCOMBO:
        case SKILL.MO_COMBOFINISH:
        case SKILL.CH_TIGERFIST:
        case SKILL.CH_CHAINCRUSH:
            if(time == 0)
                time = 1000;
            time -= (4 * player.battle_status.agi + 2 * player.status.dex);
            break;
    }

    if(skill_id == SKILL.AS_SONICBLOW_SL)
        time /= 2;

    if(skill_id == SKILL.CR_SHIELDBOOMERANG_SL)
        time /= 2;

    let delay = 0;
    if(!skill_get_delaynostatus(skill_id)) {
        if(sc_get(player, SC.POEMBRAGI)) {
            delay += sc_get(player, SC.POEMBRAGI).val6;
        }
    }

    if(player.bonus.delayrate != 0)
        delay -= player.bonus.delayrate;

    for(let it of player.skilldelay) {
        if(it.id == skill_id) {
            time += it.val;
            break;
        }
    }

    if(delay != 0)
        time = time * (1 - Math.min(delay, 100) / 100);

    return Math.max(Math.trunc(time), 0);
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_num(src, skill_id, skill_lv) {
    let sd = is_player_object(src) ? src : null; // get player data if src is player, otherwise null
    switch(skill_id) {
        case SKILL.SM_BASH:
        case SKILL.SM_MAGNUM:
        case SKILL.TF_POISON:
        case SKILL.TF_SPRINKLESAND:
        case SKILL.TF_THROWSTONE:
        case SKILL.AL_HEAL:
        case SKILL.ALL_RESURRECTION:
        case SKILL.AL_HOLYLIGHT:
        case SKILL.AL_HOLYLIGHT_SL:
        case SKILL.MG_FIREBALL:
        case SKILL.MG_FROSTDIVER:
        case SKILL.MG_NAPALMBEAT:
        case SKILL.AC_SHOWER:
        case SKILL.AC_CHARGEARROW:
        case SKILL.MC_MAMMONITE:
        case SKILL.MC_CARTREVOLUTION:
        case SKILL.KN_SPEARSTAB:
        case SKILL.KN_SPEARBOOMERANG:
        case SKILL.AS_GRIMTOOTH:
        case SKILL.AS_POISONREACT:
        case SKILL.AS_SPLASHER:
        case SKILL.PR_TURNUNDEAD:
        case SKILL.PR_SANCTUARY:
        case SKILL.HT_LANDMINE:
        case SKILL.HT_FREEZINGTRAP:
        case SKILL.HT_CLAYMORETRAP:
        case SKILL.HT_BLASTMINE:
        case SKILL.WZ_SIGHTRASHER:
        case SKILL.WZ_FROSTNOVA:
        case SKILL.CR_SHIELDCHARGE:
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
        case SKILL.RG_RAID:
        case SKILL.RG_BACKSTAP:
        case SKILL.RG_INTIMIDATE:
        case SKILL.MO_INVESTIGATE:
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
        case SKILL.MO_COMBOFINISH:
        case SKILL.BA_MUSICALSTRIKE:
        case SKILL.DC_THROWARROW:
        case SKILL.AM_DEMONSTRATION:
        case SKILL.LK_HEADCRUSH:
        case SKILL.LK_JOINTBEAT:
        case SKILL.ASC_BREAKER:
        case SKILL.ASC_METEORASSAULT:
        case SKILL.SN_FALCONASSAULT:
        case SKILL.SN_SHARPSHOOTING:
        case SKILL.HW_MAGICCRASHER:
        case SKILL.CH_PALMSTRIKE:
        case SKILL.CH_TIGERFIST:
        case SKILL.ITM_TOMAHAWK:
        case SKILL.NPC_PULSESTRIKE:
        case SKILL.AS_VENOMKNIFE:
        case SKILL.HT_PHANTASMIC:
        case SKILL.KN_CHARGEATK:
        case SKILL.SG_SUN_WARM_HEAT:
        case SKILL.SG_SUN_WARM_HEAT_NO_KNOCKBACK:
        case SKILL.SL_STIN:
        case SKILL.SL_STUN:
        case SKILL.WS_CARTTERMINATION:
        case SKILL.PA_PRESSURE:
        case SKILL.PA_SACRIFICE:
        case SKILL.MO_BALKYOUNG:
        case SKILL.NJ_SYURIKEN:
        case SKILL.NJ_ZENYNAGE:
        case SKILL.NJ_TATAMIGAESHI:
        case SKILL.NJ_KASUMIKIRI:
        case SKILL.NJ_KIRIKAGE:
        case SKILL.NJ_ISSEN:
        case SKILL.NJ_ISSEN_MAXHP:
        case SKILL.NJ_HYOUSYOURAKU:
        case SKILL.NJ_RAIGEKISAI:
        case SKILL.NJ_KAMAITACHI:
        case SKILL.GS_BULLSEYE:
        case SKILL.GS_DISARM:
        case SKILL.GS_PIERCINGSHOT:
        case SKILL.GS_DUST:
        case SKILL.GS_FULLBUSTER:
        case SKILL.GS_SPREADATTACK:
        case SKILL.NPC_HELLJUDGEMENT_MELEE:
        case SKILL.NPC_HELLJUDGEMENT_RANGED:
        case SKILL.NPC_PULSESTRIKE_MELEE:
        case SKILL.NPC_PULSESTRIKE_RANGED:
        case SKILL.NPC_NEUTRALATTACK:
        case SKILL.NPC_WATERATTACK:
        case SKILL.NPC_GROUNDATTACK:
        case SKILL.NPC_FIREATTACK:
        case SKILL.NPC_WINDATTACK:
        case SKILL.NPC_POISONATTACK:
        case SKILL.NPC_HOLYATTACK:
        case SKILL.NPC_DARKNESSATTACK:
        case SKILL.NPC_TELEKINESISATTACK:
        case SKILL.NPC_UNDEADATTACK:
        case SKILL.NPC_POISON:
        case SKILL.NPC_STUNATTACK:
        case SKILL.NPC_FREEZEATTACK:
        case SKILL.NPC_CURSEATTACK:
        case SKILL.NPC_BLINDATTACK:
        case SKILL.NPC_SLEEPATTACK:
        case SKILL.NPC_SILENCEATTACK:
        case SKILL.NPC_CHAOSATTACK:
        case SKILL.NPC_BLEEDINGATTACK:
        case SKILL.NPC_PETRIFYATTACK:
        case SKILL.NPC_GUIDEDATTACK:
        case SKILL.NPC_MAGICALATTACK:
        case SKILL.NPC_BLEEDING:
        case SKILL.NPC_CRITICALWOUND:
        case SKILL.NPC_BLOODDRAIN:
        case SKILL.NPC_ENERGYDRAIN:
        case SKILL.NPC_VAMPIRE_GIFT:
        case SKILL.NPC_PIERCINGATT:
        case SKILL.NPC_RANDOMATTACK:
        case SKILL.NPC_RANGEATTACK:
        case SKILL.NPC_SPLASHATTACK:
        case SKILL.NPC_CRITICALSLASH:
        case SKILL.NPC_DARKBREATH:
        case SKILL.NPC_SELFDESTRUCTION:
        case SKILL.NPC_NEUTRALBREATH_MELEE:
        case SKILL.NPC_NEUTRALBREATH_RANGED:
        case SKILL.NPC_ICEBREATH_MELEE:
        case SKILL.NPC_ICEBREATH_RANGED:
        case SKILL.NPC_EARTHBREATH_MELEE:
        case SKILL.NPC_EARTHBREATH_RANGED:
        case SKILL.NPC_FIREBREATH_MELEE:
        case SKILL.NPC_FIREBREATH_RANGED:
        case SKILL.NPC_THUNDERBREATH_MELEE:
        case SKILL.NPC_THUNDERBREATH_RANGED:
        case SKILL.NPC_ACIDBREATH_MELEE:
        case SKILL.NPC_ACIDBREATH_RANGED:
        case SKILL.NPC_HOLYBREATH_MELEE:
        case SKILL.NPC_HOLYBREATH_RANGED:
        case SKILL.NPC_DARKNESSBREATH_MELEE:
        case SKILL.NPC_DARKNESSBREATH_RANGED:
        case SKILL.NPC_GHOSTBREATH_MELEE:
        case SKILL.NPC_GHOSTBREATH_RANGED:
        case SKILL.NPC_UNDEADBREATH_MELEE:
        case SKILL.NPC_UNDEADBREATH_RANGED:
        case SKILL.NPC_DARKBLESSING:
        case SKILL.AB_DUPLELIGHT:
        case SKILL.RA_AIMEDBOLT:
        case SKILL.CD_ARBITRIUM:
        case SKILL.CD_ARBITRIUM_ATK:
        case SKILL.EM_VENOM_SWAMP:
        case SKILL.HT_BEASTSTRAFE_DOUBLESTRAFE:
        case SKILL.SL_ESTIN_ESMA:
        case SKILL.SL_ESTUN_ESMA:
        case SKILL.AM_ACIDTERROR:
        case SKILL.GS_TRACKING:
        case SKILL.GS_FLING:
        case SKILL.RL_FIREDANCE:
            return 1;
        case SKILL.TF_DOUBLE:
        case SKILL.AC_DOUBLE:
        case SKILL.KN_BOWLINGBASH:
        case SKILL.HT_POWER:
        case SKILL.GS_CHAINACTION:
            return 2;
        case SKILL.NJ_KUNAI:
        case SKILL.GS_TRIPLEACTION:
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHQUAKE_MELEE:
        case SKILL.NPC_EARTHQUAKE_RANGED:
        case SKILL.KN_PIERCE:
        case SKILL.CR_GRANDCROSS:
        case SKILL.NPC_GRANDDARKNESS:
        case SKILL.SO_VARETYR_SPEAR:
            return 3;
        case SKILL.KN_BRANDISHSPEAR:
        case SKILL.MO_TRIPLEATTACK:
        case SKILL.TK_JUMPKICK:
        case SKILL.TK_JUMPKICK_SPRINT:
        case SKILL.TK_STORMKICK:
        case SKILL.TK_DOWNKICK:
        case SKILL.TK_TURNKICK:
        case SKILL.TK_COUNTER:
        case SKILL.AB_JUDEX:
        case SKILL.NJ_BAKUENRYU:
            return -3;
        case SKILL.GS_DESPERADO:
            return (1 * c.SkillSubNum.value) + 1;
        case SKILL.AS_SONICBLOW:
        case SKILL.AS_SONICBLOW_SL:
            return -8;
        case SKILL.CR_HOLYCROSS:
        case SKILL.NPC_DARKCROSS:
        case SKILL.AG_FLORAL_FLARE_ROAD:
            return -2;
        case SKILL.MG_FIREBOLT:
        case SKILL.MG_COLDBOLT:
        case SKILL.MG_LIGHTNINGBOLT:
        case SKILL.MG_THUNDERSTORM:
        case SKILL.PR_MAGNUS:
        case SKILL.HT_BLITZBEAT:
        case SKILL.MO_FINGEROFFENSIVE:
        case SKILL.WZ_EARTHSPIKE:
        case SKILL.WZ_HEAVENDRIVE:
        case SKILL.HW_NAPALMVULCAN:
        case SKILL.CR_ACIDDEMONSTRATION:
        case SKILL.SL_SMA:
        case SKILL.NJ_KOUENKA:
            return skill_lv;
        case SKILL.MO_CHAINCOMBO:
            return -4;
        case SKILL.GS_RAPIDSHOWER:
            return -5;
        case SKILL.LK_SPIRALPIERCE:
        case SKILL.PA_SHIELDCHAIN:
            return 5;
        case SKILL.CH_CHAINCRUSH:
            return -Math.trunc((skill_lv + 1) / 2);
        case SKILL.CG_ARROWVULCAN:
            return -9;
        case SKILL.NJ_HUUMA:
            return skill_lv == 5 ? -5 : -Math.trunc((skill_lv + 5) / 2);
        case SKILL.NPC_COMBOATTACK:
            return -(skill_lv + 1);
        case SKILL.CD_EFFLIGO:
            return -7;
        case SKILL.MG_FIREWALL:
            return 14;
        case SKILL.MG_SOULSTRIKE:
        case SKILL.NPC_DARKSTRIKE:
        case SKILL.NPC_DARKSTRIKE2:
            return Math.trunc((skill_lv + 1) / 2);
        case SKILL.WZ_FIREPILLAR:
        case SKILL.WZ_JUPITEL:
        case SKILL.NPC_DARKTHUNDER:
        case SKILL.NJ_HYOUSENSOU:
        case SKILL.AG_SOUL_VC_STRIKE:
            return skill_lv + 2;
        case SKILL.WZ_METEOR:
            return 35;
        case SKILL.WZ_VERMILION:
            return -20;
        case SKILL.WZ_WATERBALL:
            return 25;
        case SKILL.WZ_STORMGUST:
            if(sd)
                return 1 * c.SkillSubNum.value;
            else
                return 1 * c.BSkillSubNum.value;
        case SKILL.SA_COLDBOLT_HINDSIGHT:
        case SKILL.SA_FIREBOLT_HINDSIGHT:
        case SKILL.SA_LIGHTNINGBOLT_HINDSIGHT:
            return 10;
        case SKILL.HW_GRAVITATION:
            return skill_lv + 4;
        case SKILL.NJ_KAENSIN:
            return Math.trunc((skill_lv + 9) / 2);
        case SKILL.NJ_HUUJIN:
            return Math.ceil((skill_lv + 1) / 2);
        case SKILL.WM_REVERBERATION:
            return -10;
        default:
            console.error("skill_get_num: unknown skill_id! " + skill_id);
            return 1;
    }
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_range(skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.TF_SPRINKLESAND:
        case SKILL.SM_BASH:
        case SKILL.SM_MAGNUM:
        case SKILL.TF_DOUBLE:
        case SKILL.MC_MAMMONITE:
        case SKILL.MC_CARTREVOLUTION:
        case SKILL.AS_SONICBLOW:
        case SKILL.AS_SONICBLOW_SL:
        case SKILL.AS_POISONREACT:
        case SKILL.AS_SPLASHER:
        case SKILL.CR_GRANDCROSS:
        case SKILL.RG_BACKSTAP:
        case SKILL.RG_RAID:
        case SKILL.RG_INTIMIDATE:
        case SKILL.MO_TRIPLEATTACK:
        case SKILL.ASC_METEORASSAULT:
        case SKILL.PA_SACRIFICE:
        case SKILL.NPC_PULSESTRIKE:
        case SKILL.SG_SUN_WARM_HEAT:
        case SKILL.SG_SUN_WARM_HEAT_NO_KNOCKBACK:
        case SKILL.MO_BALKYOUNG:
        case SKILL.NJ_TATAMIGAESHI:
        case SKILL.NJ_KASUMIKIRI:
        case SKILL.GS_DESPERADO:
        case SKILL.NPC_EARTHQUAKE_MELEE:
        case SKILL.NPC_HELLJUDGEMENT_MELEE:
        case SKILL.NPC_PULSESTRIKE_MELEE:
        case SKILL.NPC_GRANDDARKNESS:
        case SKILL.NPC_VAMPIRE_GIFT:
        case SKILL.NPC_NEUTRALBREATH_MELEE:
        case SKILL.NPC_ICEBREATH_MELEE:
        case SKILL.NPC_EARTHBREATH_MELEE:
        case SKILL.NPC_FIREBREATH_MELEE:
        case SKILL.NPC_THUNDERBREATH_MELEE:
        case SKILL.NPC_ACIDBREATH_MELEE:
        case SKILL.NPC_HOLYBREATH_MELEE:
        case SKILL.NPC_DARKNESSBREATH_MELEE:
        case SKILL.NPC_GHOSTBREATH_MELEE:
        case SKILL.NPC_UNDEADBREATH_MELEE:
        case SKILL.AB_DUPLELIGHT:
        case SKILL.RL_FIREDANCE:
            return 1;
        case SKILL.TF_POISON:
        case SKILL.KN_PIERCE:
        case SKILL.KN_BRANDISHSPEAR:
        case SKILL.KN_BOWLINGBASH:
        case SKILL.CR_HOLYCROSS:
        case SKILL.MO_CHAINCOMBO:
        case SKILL.MO_COMBOFINISH:
        case SKILL.MO_INVESTIGATE:
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
        case SKILL.CH_PALMSTRIKE:
        case SKILL.CH_TIGERFIST:
        case SKILL.CH_CHAINCRUSH:
        case SKILL.WS_CARTTERMINATION:
        case SKILL.TK_STORMKICK:
        case SKILL.TK_DOWNKICK:
        case SKILL.TK_TURNKICK:
        case SKILL.TK_COUNTER:
        case SKILL.NPC_DARKCROSS:
        case SKILL.CD_EFFLIGO:
        case SKILL.GS_DUST:
            return 2;
        case SKILL.HT_LANDMINE:
        case SKILL.HT_FREEZINGTRAP:
        case SKILL.HT_BLASTMINE:
        case SKILL.HT_CLAYMORETRAP:
        case SKILL.CR_SHIELDCHARGE:
            return 3;
        case SKILL.KN_SPEARSTAB:
        case SKILL.LK_HEADCRUSH:
        case SKILL.LK_JOINTBEAT:
            return 4;
        case SKILL.HT_BLITZBEAT:
        case SKILL.NJ_ISSEN:
        case SKILL.NJ_ISSEN_MAXHP:
            return 5;
        case SKILL.NPC_NEUTRALBREATH_RANGED:
        case SKILL.NPC_ICEBREATH_RANGED:
        case SKILL.NPC_EARTHBREATH_RANGED:
        case SKILL.NPC_FIREBREATH_RANGED:
        case SKILL.NPC_THUNDERBREATH_RANGED:
        case SKILL.NPC_ACIDBREATH_RANGED:
        case SKILL.NPC_HOLYBREATH_RANGED:
        case SKILL.NPC_DARKNESSBREATH_RANGED:
        case SKILL.NPC_GHOSTBREATH_RANGED:
        case SKILL.NPC_UNDEADBREATH_RANGED:
            return 6;
        case SKILL.NJ_ZENYNAGE:
        case SKILL.TF_THROWSTONE:
        case SKILL.NPC_WATERATTACK:
        case SKILL.NPC_GROUNDATTACK:
        case SKILL.NPC_FIREATTACK:
        case SKILL.NPC_WINDATTACK:
        case SKILL.NPC_POISONATTACK:
        case SKILL.NPC_HOLYATTACK:
        case SKILL.NPC_DARKNESSATTACK:
        case SKILL.NPC_TELEKINESISATTACK:
        case SKILL.NPC_UNDEADATTACK:
        case SKILL.NPC_POISON:
        case SKILL.NPC_BLINDATTACK:
        case SKILL.NPC_SILENCEATTACK:
        case SKILL.NPC_FREEZEATTACK:
        case SKILL.NPC_CHAOSATTACK:
        case SKILL.NPC_BLEEDINGATTACK:
        case SKILL.NPC_COMBOATTACK:
        case SKILL.NPC_GUIDEDATTACK:
        case SKILL.NPC_MAGICALATTACK:
        case SKILL.NPC_CRITICALWOUND:
        case SKILL.NPC_EVILLAND:
        case SKILL.NPC_BLOODDRAIN:
        case SKILL.NPC_ENERGYDRAIN:
        case SKILL.NPC_PIERCINGATT:
        case SKILL.NPC_RANDOMATTACK:
        case SKILL.NPC_RANGEATTACK:
        case SKILL.NPC_CRITICALSLASH:
        case SKILL.LK_SPIRALPIERCE:
            return 7;
        case SKILL.PA_SHIELDCHAIN:
            return 8;
        case SKILL.AL_HEAL:
        case SKILL.AL_HOLYLIGHT:
        case SKILL.AL_HOLYLIGHT_SL:
        case SKILL.AC_DOUBLE:
        case SKILL.AC_SHOWER:
        case SKILL.AC_CHARGEARROW:
        case SKILL.MG_NAPALMBEAT:
        case SKILL.MG_SOULSTRIKE:
        case SKILL.MG_FIREBOLT:
        case SKILL.MG_FIREBALL:
        case SKILL.MG_FIREWALL:
        case SKILL.MG_COLDBOLT:
        case SKILL.MG_FROSTDIVER:
        case SKILL.MG_LIGHTNINGBOLT:
        case SKILL.MG_THUNDERSTORM:
        case SKILL.ALL_RESURRECTION:
        case SKILL.PR_TURNUNDEAD:
        case SKILL.PR_MAGNUS:
        case SKILL.PR_SANCTUARY:
        case SKILL.WZ_FIREPILLAR:
        case SKILL.WZ_SIGHTRASHER:
        case SKILL.WZ_METEOR:
        case SKILL.WZ_JUPITEL:
        case SKILL.WZ_VERMILION:
        case SKILL.WZ_WATERBALL:
        case SKILL.WZ_FROSTNOVA:
        case SKILL.WZ_STORMGUST:
        case SKILL.WZ_EARTHSPIKE:
        case SKILL.WZ_HEAVENDRIVE:
        case SKILL.MO_FINGEROFFENSIVE:
        case SKILL.BA_MUSICALSTRIKE:
        case SKILL.DC_THROWARROW:
        case SKILL.AM_ACIDTERROR:
        case SKILL.AM_DEMONSTRATION:
        case SKILL.ASC_BREAKER:
        case SKILL.SN_FALCONASSAULT:
        case SKILL.SN_SHARPSHOOTING:
        case SKILL.HW_MAGICCRASHER:
        case SKILL.HW_NAPALMVULCAN:
        case SKILL.PA_PRESSURE:
        case SKILL.CG_ARROWVULCAN:
        case SKILL.ITM_TOMAHAWK:
        case SKILL.TK_JUMPKICK:
        case SKILL.TK_JUMPKICK_SPRINT:
        case SKILL.AS_VENOMKNIFE:
        case SKILL.HT_PHANTASMIC:
        case SKILL.HT_BEASTSTRAFE_DOUBLESTRAFE:
        case SKILL.NPC_DARKSTRIKE:
        case SKILL.NPC_DARKSTRIKE2:
        case SKILL.HW_GRAVITATION:
        case SKILL.CR_ACIDDEMONSTRATION:
        case SKILL.SL_STIN:
        case SKILL.SL_STUN:
        case SKILL.SL_SMA:
        case SKILL.SL_ESTIN_ESMA:
        case SKILL.SL_ESTUN_ESMA:
        case SKILL.HT_POWER:
        case SKILL.NJ_SYURIKEN:
        case SKILL.NJ_KUNAI:
        case SKILL.NJ_HUUMA:
        case SKILL.NJ_KOUENKA:
        case SKILL.NJ_KAENSIN:
        case SKILL.NJ_BAKUENRYU:
        case SKILL.NJ_HYOUSENSOU:
        case SKILL.NJ_HYOUSYOURAKU:
        case SKILL.NJ_HUUJIN:
        case SKILL.NJ_RAIGEKISAI:
        case SKILL.GS_TRIPLEACTION:
        case SKILL.GS_BULLSEYE:
        case SKILL.GS_RAPIDSHOWER:
        case SKILL.GS_TRACKING:
        case SKILL.GS_DISARM:
        case SKILL.GS_PIERCINGSHOT:
        case SKILL.GS_FULLBUSTER:
        case SKILL.GS_SPREADATTACK:
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHQUAKE_RANGED:
        case SKILL.NPC_HELLJUDGEMENT_RANGED:
        case SKILL.NPC_PULSESTRIKE_RANGED:
        case SKILL.NPC_DARKTHUNDER:
        case SKILL.NPC_BLEEDING:
        case SKILL.NPC_SPLASHATTACK:
        case SKILL.NPC_DARKBREATH:
        case SKILL.NPC_SELFDESTRUCTION:
        case SKILL.NPC_DARKBLESSING:
        case SKILL.SA_FIREBOLT_HINDSIGHT:
        case SKILL.SA_COLDBOLT_HINDSIGHT:
        case SKILL.SA_LIGHTNINGBOLT_HINDSIGHT:
        case SKILL.AB_JUDEX:
        case SKILL.RA_AIMEDBOLT:
        case SKILL.WM_REVERBERATION:
        case SKILL.SO_VARETYR_SPEAR:
        case SKILL.AG_SOUL_VC_STRIKE:
        case SKILL.AG_FLORAL_FLARE_ROAD:
        case SKILL.EM_VENOM_SWAMP:
        case SKILL.CD_ARBITRIUM:
        case SKILL.CD_ARBITRIUM_ATK:
        case SKILL.GS_FLING:
            return 9;
        case SKILL.KN_CHARGEATK:
        case SKILL.NPC_STUNATTACK:
        case SKILL.NPC_PETRIFYATTACK:
        case SKILL.NPC_CURSEATTACK:
        case SKILL.NPC_SLEEPATTACK:
            return 14;
        case SKILL.KN_SPEARBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
            return (skill_lv * 2) + 1;
        case SKILL.AS_GRIMTOOTH:
            return skill_lv + 2;
        case SKILL.NJ_KIRIKAGE:
        case SKILL.NJ_KAMAITACHI:
            return skill_lv + 4;
        default:
            console.error("skill_get_range: unknown skill_id! " + skill_id);
            return 1;
    }
}

/**
 * 
 * @param {PlayerData|MonsterData} src 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_range2(src, skill_id, skill_lv) {
    let range = skill_get_range(skill_id, skill_lv);

    if(src.type == BL.PC) {
        switch(skill_id) {
            case SKILL.AC_DOUBLE:
            case SKILL.AC_SHOWER:
            case SKILL.HT_BLITZBEAT:
            case SKILL.AC_CHARGEARROW:
            case SKILL.HT_POWER:
                range += SkillSearch(SKILL.AC_VULTURE);
                break;
            case SKILL.GS_PIERCINGSHOT:
            case SKILL.GS_RAPIDSHOWER:
            case SKILL.GS_FULLBUSTER:
            case SKILL.GS_GROUNDDRIFT:
                range += SkillSearch(SKILL.GS_SNAKEEYE);
                break;
        }
    }
    
    return range;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_ele(skill_id, skill_lv) {
    return m_Skill[skill_id][5];
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignore_flee(skill_id) {
    switch(skill_id) {
        case SKILL.HT_LANDMINE:
        case SKILL.HT_FREEZINGTRAP:
        case SKILL.HT_BLASTMINE:
        case SKILL.HT_CLAYMORETRAP:
        case SKILL.HT_BLITZBEAT:
        case SKILL.AS_SPLASHER:
        case SKILL.TF_THROWSTONE:
        case SKILL.NPC_GUIDEDATTACK:
        case SKILL.NPC_SELFDESTRUCTION:
        case SKILL.NPC_BLOODDRAIN:
        case SKILL.RG_BACKSTAP:
        case SKILL.MO_INVESTIGATE:
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
        case SKILL.NPC_GRANDDARKNESS:
        case SKILL.PA_PRESSURE:
        case SKILL.PA_SACRIFICE:
        case SKILL.SN_FALCONASSAULT:
        case SKILL.TK_COUNTER:
        case SKILL.HW_GRAVITATION:
        case SKILL.CR_ACIDDEMONSTRATION:
        case SKILL.NJ_ZENYNAGE:
        case SKILL.NJ_ISSEN:
        case SKILL.NJ_ISSEN_MAXHP:
        case SKILL.NPC_EVILLAND:
        case SKILL.AM_ACIDTERROR:
        case SKILL.GS_GROUNDDRIFT:
        case SKILL.GS_FLING:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_can_crit(skill_id) {
    switch(skill_id) {
        case SKILL.SN_SHARPSHOOTING:
        case SKILL.NJ_KIRIKAGE:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_def(skill_id) {
    switch(skill_id) {
        case SKILL.AL_HEAL:
        case SKILL.PR_ASPERSIO:
        case SKILL.PR_BENEDICTIO:
        case SKILL.PR_SANCTUARY:
        case SKILL.PR_TURNUNDEAD:
        case SKILL.WZ_FIREPILLAR:
        case SKILL.NPC_PIERCINGATT:
        case SKILL.NPC_CRITICALSLASH:
        case SKILL.NPC_SELFDESTRUCTION:
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
        case SKILL.PA_SACRIFICE:
        case SKILL.LK_SPIRALPIERCE:
        case SKILL.GS_PIERCINGSHOT:
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHQUAKE_MELEE:
        case SKILL.NPC_EARTHQUAKE_RANGED:
        case SKILL.AM_ACIDTERROR:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_element(skill_id) {
    switch(skill_id) {
        case SKILL.PR_ASPERSIO:
        case SKILL.PA_PRESSURE:
        case SKILL.PF_SOULBURN:
        case SKILL.HW_GRAVITATION:
        case SKILL.GS_FLING:
        case SKILL.NJ_ZENYNAGE:
        case SKILL.NPC_EVILLAND:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_atkcard(skill_id) {
    switch(skill_id) {
        case SKILL.PR_TURNUNDEAD:
        case SKILL.AM_DEMONSTRATION:
        case SKILL.NPC_GRANDDARKNESS:
        case SKILL.PF_SOULBURN:
        case SKILL.GS_GROUNDDRIFT:
        case SKILL.NJ_SYURIKEN:
        case SKILL.NJ_KUNAI:
        case SKILL.NJ_TATAMIGAESHI:
        case SKILL.AS_VENOMKNIFE:
        case SKILL.MO_BALKYOUNG:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_defcard(skill_id) {
    switch(skill_id) {
        case SKILL.HT_LANDMINE:
        case SKILL.HT_BLASTMINE:
        case SKILL.HT_CLAYMORETRAP:
        case SKILL.NPC_SELFDESTRUCTION:
        case SKILL.PA_PRESSURE:
        case SKILL.PF_SOULBURN:
        case SKILL.HW_GRAVITATION:
        case SKILL.NPC_EVILLAND:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_longcard(skill_id) {
    switch(skill_id) {

    }

    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_ignores_gvgreduction(skill_id) {
    switch(skill_id) {
        case SKILL.PA_PRESSURE:
        case SKILL.HW_GRAVITATION:
        case SKILL.NJ_ZENYNAGE:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_cast(skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.MG_NAPALMBEAT:
            return 1000;
        case SKILL.MG_SAFETYWALL:
            return skill_lv < 7 ? 4500 - (skill_lv * 500) : 1000;
        case SKILL.MG_SOULSTRIKE:
            return 500;
        case SKILL.MG_COLDBOLT:
        case SKILL.MG_FIREBOLT:
        case SKILL.MG_LIGHTNINGBOLT:
            return 700 * skill_lv;
        case SKILL.MG_FROSTDIVER:
            return 800;
        case SKILL.MG_STONECURSE:
            return 1000;
        case SKILL.MG_FIREBALL:
            return skill_lv < 6 ? 1500 : 1000;
        case SKILL.MG_FIREWALL:
            return 2150 - (150 * skill_lv);
        case SKILL.MG_THUNDERSTORM:
            return 1000 * skill_lv;
        case SKILL.AL_WARP:
            return 1000;
        case SKILL.AL_INCAGI:
            return 1000;
        case SKILL.AL_DECAGI:
            return 1000;
        case SKILL.AL_HOLYWATER:
            return 1000;
        case SKILL.AL_CRUCIS:
            return 500;
        case SKILL.AL_ANGELUS:
            return 500;
        case SKILL.ALL_RESURRECTION:
            return skill_lv < 4 ? 8000 - (2000 * skill_lv) : 0;
        case SKILL.KN_BRANDISHSPEAR:
            return 0;
        case SKILL.KN_BOWLINGBASH:
            return 700;
        case SKILL.PR_IMPOSITIO:
            return 1000;
        case SKILL.PR_SANCTUARY:
            return 5000;
        case SKILL.PR_KYRIE:
            return 2000;
        case SKILL.PR_MAGNIFICAT:
            return 4000;
        case SKILL.PR_TURNUNDEAD:
            return 1000;
        case SKILL.PR_MAGNUS:
            return 15000;
        case SKILL.WZ_FIREPILLAR:
            return 3300 - (300 * skill_lv);
        case SKILL.WZ_SIGHTRASHER:
            return 500;
        case SKILL.WZ_METEOR:
            return 15000;
        case SKILL.WZ_JUPITEL:
            return 2000 + (500 * skill_lv);
        case SKILL.WZ_VERMILION:
            return 15500 - (500 * skill_lv);
        case SKILL.WZ_WATERBALL:
            return 1000 * skill_lv;
        case SKILL.WZ_FROSTNOVA:
            switch(skill_lv) {
                case 1:
                case 2:
                    return 6000;
                case 3:
                case 4:
                    return 5500;
                case 5:
                case 6:
                    return 5000;
                case 7:
                case 8:
                    return 4500;
                case 9:
                case 10:
                    return 4000;
            }
            return 0;
        case SKILL.WZ_STORMGUST:
            return 5000 + (1000 * skill_lv);
        case SKILL.WZ_EARTHSPIKE:
            return 1000 * skill_lv;
        case SKILL.WZ_HEAVENDRIVE:
            return 1000 * skill_lv;
        case SKILL.BS_REPAIRWEAPON:
            return 7500;
        case SKILL.HT_BLITZBEAT:
            return 1500;
        case SKILL.AS_SPLASHER:
            return 500;
        case SKILL.AC_CHARGEARROW:
            return 1500;
        case SKILL.TF_PICKSTONE:
            return 500;
        case SKILL.AL_HOLYLIGHT:
        case SKILL.AL_HOLYLIGHT_SL:
            return 1000;
        case SKILL.MG_ENERGYCOAT:
            return 5000;
        case SKILL.RG_STRIPWEAPON:
        case SKILL.RG_STRIPSHIELD:
        case SKILL.RG_STRIPARMOR:
        case SKILL.RG_STRIPHELM:
            return 1000;
        case SKILL.AM_DEMONSTRATION:
            return 5000;
        case SKILL.AM_ACIDTERROR:
            return 1000;
        case SKILL.AM_CANNIBALIZE:
            return 2000;
        case SKILL.AM_SPHEREMINE:
            return 2000;
        case SKILL.AM_CP_WEAPON:
        case SKILL.AM_CP_HELM:
        case SKILL.AM_CP_SHIELD:
        case SKILL.AM_CP_ARMOR:
            return 2000;
        case SKILL.CR_GRANDCROSS:
            return 3000;
        case SKILL.CR_DEVOTION:
            return 3000;
        case SKILL.CR_PROVIDENCE:
            return 3000;
        case SKILL.MO_CALLSPIRITS:
            return 1000;
        case SKILL.MO_ABSORBSPIRITS:
            return 2000;
        case SKILL.MO_INVESTIGATE:
            return 1000;
        case SKILL.MO_FINGEROFFENSIVE:
            return 1000 + 1000 * Math.min(skill_lv, player.spiritball);
        case SKILL.MO_STEELBODY:
            return 5000;
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
            return 4500 - (500 * skill_lv);
        case SKILL.SA_SPELLBREAKER:
            return 700;
        case SKILL.SA_AUTOSPELL:
            return 3000;
        case SKILL.SA_FLAMELAUNCHER:
        case SKILL.SA_FROSTWEAPON:
        case SKILL.SA_LIGHTNINGLOADER:
        case SKILL.SA_SEISMICWEAPON:
            return 3000;
        case SKILL.SA_VOLCANO:
        case SKILL.SA_DELUGE:
        case SKILL.SA_VIOLENTGALE:
            return 5000;
        case SKILL.SA_LANDPROTECTOR:
            return 5000;
        case SKILL.SA_DISPELL:
            return 2000;
        case SKILL.BA_MUSICALSTRIKE:
            return 1500;
        case SKILL.DC_THROWARROW:
            return 1500;
        case SKILL.HP_ASSUMPTIO:
            return 1000 + (500 * skill_lv);
        case SKILL.HP_BASILICA:
            return 5000 + (1000 * skill_lv);
        case SKILL.HW_MAGICCRASHER:
            return 300;
        case SKILL.HW_MAGICPOWER:
            return 700;
        case SKILL.PA_PRESSURE:
            return 1500 + (500 * skill_lv);
        case SKILL.PF_SOULCHANGE:
            return 3000;
        case SKILL.ASC_BREAKER:
            return 700;
        case SKILL.SN_FALCONASSAULT:
            return 1000;
        case SKILL.SN_SHARPSHOOTING:
            return 2000;
        case SKILL.SN_WINDWALK:
            return 1600 + (400 * skill_lv);
        case SKILL.WS_MELTDOWN:
            switch(skill_lv) {
                case 1:
                case 2:
                    return 500;
                case 3:
                case 4:
                    return 600;
                case 5:
                case 6:
                    return 700;
                case 7:
                case 8:
                    return 800;
                case 9:
                    return 900;
                case 10:
                    return 1000;
            }
            return 0;
        case SKILL.ST_CHASEWALK:
            return 1200;
        case SKILL.CG_ARROWVULCAN:
            return 2000 + (200 * skill_lv);
        case SKILL.LK_SPIRALPIERCE:
            return skill_lv < 5 ? 300 + (200 * skill_lv) : 1000;
        case SKILL.HW_NAPALMVULCAN:
            return 1000;
        case SKILL.CH_SOULCOLLECT:
            return 2000;
        case SKILL.PF_MEMORIZE:
            return 5000;
        case SKILL.TK_RUN:
            return skill_lv < 7 ? 7000 - (1000 * skill_lv) : 0;
        case SKILL.TK_HIGHJUMP:
            return 6000 - (1000 * skill_lv);
        case SKILL.SG_FEEL:
            return 1000;
        case SKILL.SL_KAIZEL:
            return 4000 - (500 * skill_lv);
        case SKILL.SL_KAUPE:
            return 500;
        case SKILL.SL_KAITE:
            return 4500 - (500 * skill_lv);
        case SKILL.SL_STIN:
            return 100;
        case SKILL.SL_STUN:
            return 100;
        case SKILL.SL_SMA:
            return 2000;
        case SKILL.SL_SWOO:
            return 1000;
        case SKILL.SL_SKE:
            return 4000 - (1000 * skill_lv);
        case SKILL.SL_SKA:
            return 4000 - (1000 * skill_lv);
        case SKILL.PA_SHIELDCHAIN:
            return 1000;
        case SKILL.PF_DOUBLECASTING:
            return 2000;
        case SKILL.HW_GRAVITATION:
            return 5000;
        case SKILL.CG_TAROTCARD:
            return 1000;
        case SKILL.CR_ACIDDEMONSTRATION:
            return 1000;
        case SKILL.GS_BULLSEYE:
            return 500;
        case SKILL.GS_MADNESSCANCEL:
            return 3000;
        case SKILL.GS_ADJUSTMENT:
            return 1000;
        case SKILL.GS_PIERCINGSHOT:
            return 1500;
        case SKILL.GS_DUST:
            return 1000;
        case SKILL.GS_GROUNDDRIFT:
            return 2000;
        case SKILL.NJ_HUUMA:
            return 3000;
        case SKILL.NJ_BUNSINJYUTSU:
            return skill_lv < 7 ? 4500 - (500 * skill_lv) : 1000;
        case SKILL.NJ_KOUENKA:
            return 700 * skill_lv;
        case SKILL.NJ_KAENSIN:
            return 6500 - (500 * skill_lv);
        case SKILL.NJ_BAKUENRYU:
            return 3000;
        case SKILL.NJ_HYOUSENSOU:
            return 700 * skill_lv;
        case SKILL.NJ_SUITON:
            return 3000;
        case SKILL.NJ_HYOUSYOURAKU:
            return 1500 + (500 * skill_lv);
        case SKILL.NJ_HUUJIN:
            return 500 + (500 * skill_lv);
        case SKILL.NJ_RAIGEKISAI:
            return 4000;
        case SKILL.NJ_KAMAITACHI:
            return 4000;
        case SKILL.NJ_NEN:
            return 6000 - (1000 * skill_lv);
        case SKILL.KN_CHARGEATK:
            return 500;
        case SKILL.DC_WINKCHARM:
            return 1000;
        case SKILL.AB_JUDEX:
            return 2000;
        case SKILL.WM_REVERBERATION:
            return 1000;
        case SKILL.NPC_DARKSTRIKE:
        case SKILL.NPC_DARKSTRIKE2:
            return 500;
        case SKILL.NPC_GRANDDARKNESS:
            return 3000;
        case SKILL.NPC_EVILLAND:
            return 5000;
    }
    return 0;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_fix_cast_sub(skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.GS_TRACKING:
            return 1000 + 200 * skill_lv;
        case SKILL.RA_AIMEDBOLT:
            return 750;
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHBREATH_MELEE:
        case SKILL.NPC_EARTHBREATH_RANGED:
            return 2000;
        case SKILL.WM_REVERBERATION:
            return 500;
    }

    return 0;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_fix_cast(skill_id, skill_lv) {
    let time = skill_get_fix_cast_sub(skill_id, skill_lv);

    return Math.max(0, time);
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_delay(skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.SM_MAGNUM:
            return 2000;
        case SKILL.MG_NAPALMBEAT:
            switch(skill_lv) {
                case 1:
                case 2:
                case 3:
                    return 1000;
                case 4:
                case 5:
                    return 900;
                case 6:
                case 7:
                    return 800;
                case 8:
                    return 700;
                case 9:
                    return 600;
                case 10:
                    return 500;
            }
            return 0;
        case SKILL.MG_SOULSTRIKE:
            switch(skill_lv) {
                case 1:
                    return 1200;
                case 2:
                    return 1000;
                case 3:
                    return 1400;
                case 4:
                    return 1200;
                case 5:
                    return 1600;
                case 6:
                    return 1400;
                case 7:
                    return 1800;
                case 8:
                    return 1600;
                case 9:
                    return 2000;
                case 10:
                    return 1800;
            }
            return 0;
        case SKILL.MG_COLDBOLT:
        case SKILL.MG_FIREBOLT:
        case SKILL.MG_LIGHTNINGBOLT:
            return 800 + (200 * skill_lv);
        case SKILL.MG_FROSTDIVER:
            return 1500;
        case SKILL.MG_FIREBALL:
            return skill_lv < 6 ? 1500 : 1000;
        case SKILL.MG_THUNDERSTORM:
            return 2000;
        case SKILL.AL_HEAL:
            return 1000;
        case SKILL.AL_INCAGI:
            return 1000;
        case SKILL.AL_DECAGI:
            return 1000;
        case SKILL.AL_HOLYWATER:
            return 500;
        case SKILL.AL_CRUCIS:
            return 2000;
        case SKILL.AL_ANGELUS:
            return 3500;
        case SKILL.AL_CURE:
            return 1000;
        case SKILL.ALL_RESURRECTION:
            switch(skill_lv) {
                case 2:
                    return 1000;
                case 3:
                    return 2000;
                case 4:
                    return 3000;
            }
            return 0;
        case SKILL.KN_SPEARBOOMERANG:
            return 1000;
        case SKILL.PR_SUFFRAGIUM:
            return 2000;
        case SKILL.PR_ASPERSIO:
            return 2000;
        case SKILL.PR_STRECOVERY:
            return 2000;
        case SKILL.PR_KYRIE:
            return 2000;
        case SKILL.PR_MAGNIFICAT:
            return 2000;
        case SKILL.PR_GLORIA:
            return 2000;
        case SKILL.PR_LEXDIVINA:
            return 3000;
        case SKILL.PR_TURNUNDEAD:
            return 3000;
        case SKILL.PR_LEXAETERNA:
            return 3000;
        case SKILL.PR_MAGNUS:
            return 4000;
        case SKILL.WZ_FIREPILLAR:
            return 1000;
        case SKILL.WZ_SIGHTRASHER:
            return 2000;
        case SKILL.WZ_METEOR:
            switch(skill_lv) {
                case 1:
                    return 2000;
                case 2:
                case 3:
                    return 3000;
                case 4:
                case 5:
                    return 4000;
                case 6:
                case 7:
                    return 5000;
                case 8:
                case 9:
                    return 6000;
                case 10:
                    return 7000;
            }
            return 0;
        case SKILL.WZ_VERMILION:
            return 5000;
        case SKILL.WZ_FROSTNOVA:
            return 1000;
        case SKILL.WZ_STORMGUST:
            return 5000;
        case SKILL.WZ_EARTHSPIKE:
            return 700;
        case SKILL.WZ_HEAVENDRIVE:
            return 700;
        case SKILL.WZ_QUAGMIRE:
            return 1000;
        case SKILL.HT_BLITZBEAT:
            return 1000;
        case SKILL.AS_SONICBLOW:
            return 2000;
        case SKILL.AS_SONICBLOW_SL:
            if(c.A8_Skill14.value == 1) // woe map
                return 2000;
            return 1500;
        case SKILL.RG_STRIPWEAPON:
        case SKILL.RG_STRIPSHIELD:
        case SKILL.RG_STRIPHELM:
        case SKILL.RG_STRIPARMOR:
            return 1000;
        case SKILL.RG_BACKSTAP:
            return 500;
        case SKILL.AM_ACIDTERROR:
            return 0;
        case SKILL.AM_POTIONPITCHER:
            return 500;
        case SKILL.AM_CANNIBALIZE:
            return 500;
        case SKILL.AM_SPHEREMINE:
            return 500;
        case SKILL.CR_SHIELDBOOMERANG:
        case SKILL.CR_SHIELDBOOMERANG_SL:
            return 700;
        case SKILL.CR_GRANDCROSS:
            return 1500;
        case SKILL.CR_DEFENDER:
            return 800;
        case SKILL.MO_INVESTIGATE:
            return 500;
        case SKILL.MO_FINGEROFFENSIVE:
            return 500;
        case SKILL.MO_EXTREMITYFIST:
        case SKILL.MO_EXTREMITYFIST_MAXSP:
            return 3500 - (500 * skill_lv);
        case SKILL.BA_FROSTJOKER:
        case SKILL.DC_SCREAM:
            return 4000;
        case SKILL.HP_ASSUMPTIO:
            return 1000 + (100 * skill_lv);
        case SKILL.HP_BASILICA:
            return 1000 + (1000 * skill_lv);
        case SKILL.HW_MAGICCRASHER:
            return 300;
        case SKILL.PA_PRESSURE:
            return 1500 + (500 * skill_lv);
        case SKILL.PA_SACRIFICE:
            return 2000;
        case SKILL.CH_PALMSTRIKE:
            return 300;
        case SKILL.PF_HPCONVERSION:
            return 800 + (200 * skill_lv);
        case SKILL.PF_SOULCHANGE:
            return 5000;
        case SKILL.ASC_EDP:
            return 2000;
        case SKILL.ASC_BREAKER:
            return 150 * skill_lv;
        case SKILL.SN_FALCONASSAULT:
            return 3000;
        case SKILL.SN_SHARPSHOOTING:
            return 1500;
        case SKILL.SN_WINDWALK:
            return 2000;
        case SKILL.CG_ARROWVULCAN:
            return skill_lv < 6 ? 2800 : 3000;
        case SKILL.LK_SPIRALPIERCE:
            return 1000 + (200 * skill_lv);
        case SKILL.LK_HEADCRUSH:
            return 500;
        case SKILL.LK_JOINTBEAT:
            return skill_lv < 6 ? 800 : 1000;
        case SKILL.HW_NAPALMVULCAN:
            return 1000;
        case SKILL.PF_MINDBREAKER:
            return 700 + (100 * skill_lv);
        case SKILL.ASC_METEORASSAULT:
            return 400;
        case SKILL.ASC_CDP:
            return 500;
        case SKILL.SG_FUSION:
            return 1000;
        case SKILL.SL_KAAHI:
            return 500;
        case SKILL.SL_KAUPE:
            return 500;
        case SKILL.SL_STIN:
            return 500;
        case SKILL.SL_STUN:
            return 500;
        case SKILL.SL_SMA:
            return 500;
        case SKILL.SL_SWOO:
            return 500;
        case SKILL.SL_SKE:
            return 500;
        case SKILL.SL_SKA:
            return 500;
        case SKILL.ST_FULLSTRIP:
            return 1000;
        case SKILL.PA_SHIELDCHAIN:
            return 1000;
        case SKILL.HW_GRAVITATION:
            return 2000;
        case SKILL.CG_TAROTCARD:
            return 3000;
        case SKILL.CR_ACIDDEMONSTRATION:
            return 1000;
        case SKILL.GS_ADJUSTMENT:
            return 1000;
        case SKILL.GS_INCREASING:
            return 1000;
        case SKILL.GS_CRACKER:
            return 1000;
        case SKILL.GS_RAPIDSHOWER:
            return 1000;
        case SKILL.GS_DESPERADO:
            return 1000;
        case SKILL.GS_FULLBUSTER:
            return 1000 + 200 * skill_lv;
        case SKILL.GS_SPREADATTACK:
            return 2000;
        case SKILL.NJ_KUNAI:
            return 1000;
        case SKILL.NJ_HUUMA:
            return 2000;
        case SKILL.NJ_ZENYNAGE:
            return 5000;
        case SKILL.NJ_TATAMIGAESHI:
            return 3000;
        case SKILL.NJ_KASUMIKIRI:
            return 1000;
        case SKILL.NJ_SHADOWJUMP:
            return 1000;
        case SKILL.NJ_UTSUSEMI:
            return 1000;
        case SKILL.NJ_BUNSINJYUTSU:
            return 1000;
        case SKILL.NJ_KAENSIN:
            return 1000;
        case SKILL.NJ_BAKUENRYU:
            return 2000;
        case SKILL.NJ_HYOUSYOURAKU:
            return 2000;
        case SKILL.NJ_HUUJIN:
            return 1000;
        case SKILL.DC_WINKCHARM:
            return 2000;
        case SKILL.MO_BALKYOUNG:
            return 2000;
        case SKILL.AB_JUDEX:
            return 500;
        case SKILL.RA_AIMEDBOLT:
            return 500;
        case SKILL.WM_REVERBERATION:
            return 500;
        case SKILL.NPC_DARKSTRIKE:
        case SKILL.NPC_DARKSTRIKE2:
            switch(skill_lv) {
                case 1:
                    return 1200;
                case 2:
                    return 1000;
                case 3:
                    return 1400;
                case 4:
                    return 1200;
                case 5:
                    return 1600;
                case 6:
                    return 1400;
                case 7:
                    return 1800;
                case 8:
                    return 1600;
                case 9:
                    return 2000;
                case 10:
                    return 1800;
            }
            return 0;
        case SKILL.NPC_GRANDDARKNESS:
            return 1500;
        case SKILL.NPC_CURSEATTACK:
            return 1500;
        case SKILL.NPC_SLEEPATTACK:
            return 1500;
        case SKILL.NPC_PETRIFYATTACK:
            return 1500;
        case SKILL.NPC_SILENCEATTACK:
            return 1500;
        case SKILL.NPC_STUNATTACK:
            return 1500;
        case SKILL.NPC_DARKBLESSING:
            return 5000;
        case SKILL.AM_DEMONSTRATION:
            return 3000;
    }
    return 0;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} skill_lv 
 * @returns 
 */
function skill_get_cooldown(skill_id, skill_lv) {
    switch(skill_id) {
        case SKILL.SM_PROVOKE:
            return 1000;
        case SKILL.SM_ENDURE:
            return 10000;
        case SKILL.PR_BENEDICTIO:
            return 30000;
        case SKILL.AS_SONICBLOW:
        case SKILL.AS_SONICBLOW_SL:
            return 2000;
        case SKILL.AS_SPLASHER:
            return 3500 + (250 * skill_lv);
        case SKILL.PF_SOULBURN:
            return skill_lv < 5 ? 10000 : 15000;
        case SKILL.GS_MAGICALBULLET:
            return 5000;
        case SKILL.NPC_SELFDESTRUCTION:
            return 30000;
        case SKILL.NPC_DARKBLESSING:
            return 30000;
        case SKILL.NPC_EARTHQUAKE:
        case SKILL.NPC_EARTHBREATH_MELEE:
        case SKILL.NPC_EARTHBREATH_RANGED:
            return 30000;
        case SKILL.WM_REVERBERATION:
            return 150;
    }
    return 0;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_get_castnodex(skill_id) {
    switch(skill_id) {
        case SKILL.HW_MAGICPOWER:
        case SKILL.CH_PALMSTRIKE:
        case SKILL.PF_MEMORIZE:
        case SKILL.SL_KAIZEL:
        case SKILL.PF_DOUBLECASTING:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_get_delaynostatus(skill_id) {
    switch(skill_id) {
        case SKILL.AS_SONICBLOW:
        case SKILL.AS_SONICBLOW_SL:
        case SKILL.MO_TRIPLEATTACK:
        case SKILL.MO_CHAINCOMBO:
        case SKILL.MO_COMBOFINISH:
        case SKILL.CH_TIGERFIST:
        case SKILL.CH_CHAINCRUSH:
        case SKILL.CG_ARROWVULCAN:
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} skill_id 
 * @returns 
 */
function skill_get_unitdelay(skill_id) {
    switch(skill_id) {
        case SKILL.PR_MAGNUS:
            return 3000;
        case SKILL.WZ_STORMGUST:
            return 450;
        case SKILL.AM_DEMONSTRATION:
            return 1000;
    }
    return 0;
}

/**
 * 
 * @param {number} skill_id 
 * @param {number} flag 
 * @returns 
 */
function skill_is_aoe( skill_id, flag )
{
	switch( skill_id ){
		case 0:
			if( !(flag&(BF.SKILL)) ) // If a normal attack is a skill, it's splash damage.
			break;
		case SKILL.SM_MAGNUM:
		case SKILL.MG_FIREBALL:
		case SKILL.MG_FIREWALL:
		case SKILL.MG_THUNDERSTORM:
		case SKILL.AC_SHOWER:
		case SKILL.MC_CARTREVOLUTION:
		case SKILL.KN_BOWLINGBASH:
		case SKILL.KN_BRANDISHSPEAR:
		case SKILL.WZ_FROSTNOVA:
		case SKILL.WZ_HEAVENDRIVE:
		case SKILL.WZ_VERMILION:
		case SKILL.WZ_METEOR:
		case SKILL.WZ_STORMGUST:
		case SKILL.HW_GRAVITATION:
		case SKILL.HW_NAPALMVULCAN:
		case SKILL.HT_CLAYMORETRAP:
		case SKILL.HT_BLITZBEAT:
		case SKILL.SN_FALCONASSAULT:
		case SKILL.SN_SHARPSHOOTING:
		case SKILL.AS_GRIMTOOTH:
		case SKILL.AS_VENOMDUST:
		case SKILL.AS_SPLASHER:
		case SKILL.ASC_METEORASSAULT:
		case SKILL.PR_MAGNUS:
		case SKILL.PR_SANCTUARY:
		case SKILL.CR_GRANDCROSS:
		case SKILL.BA_DISSONANCE:
		case SKILL.NPC_SELFDESTRUCTION: // from AM_SPHEREMINE
		case SKILL.AM_DEMONSTRATION:
		case SKILL.RG_RAID:
		case SKILL.TK_STORMKICK:
		case SKILL.SG_MOON_WARM:
		case SKILL.SG_SUN_WARM:
		case SKILL.SG_STAR_WARM:
		case SKILL.NJ_HUUMA:
		case SKILL.NJ_KAENSIN:
		case SKILL.MG_NAPALMBEAT:
		case SKILL.NJ_BAKUENRYU:
		case SKILL.NJ_HYOUSYOURAKU:
		case SKILL.NJ_RAIGEKISAI:
		case SKILL.NJ_KAMAITACHI:
		case SKILL.GS_DESPERADO:
        case SKILL.RL_FIREDANCE:
		case SKILL.GS_SPREADATTACK:
		case SKILL.GS_GROUNDDRIFT:
		case SKILL.WM_REVERBERATION:
			return true;
		}
	return false;
}