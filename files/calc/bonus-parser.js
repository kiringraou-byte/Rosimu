function PlayerApplyBonus(type, val) {
    let status = player.base_status;
    let bonus;

    switch(type) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            player.indexed_bonus.param_bonus[type - 1] += val;
            break;
        case 7: // all stats
            player.indexed_bonus.param_bonus[STAT.STR] += val;
            player.indexed_bonus.param_bonus[STAT.AGI] += val;
            player.indexed_bonus.param_bonus[STAT.VIT] += val;
            player.indexed_bonus.param_bonus[STAT.INT] += val;
            player.indexed_bonus.param_bonus[STAT.DEX] += val;
            player.indexed_bonus.param_bonus[STAT.LUK] += val;
            break;
        case 8: // hit
            bonus = status.hit + val;
            status.hit = cap_value(bonus, SHRT_MIN, SHRT_MAX);
            break;
        case 9: // flee
            bonus = status.flee + val;
            status.flee = cap_value(bonus, SHRT_MIN, SHRT_MAX);
            break;
        case 10: // crit
            bonus = status.cri + val * 10;
            status.cri = cap_value(bonus, SHRT_MIN, SHRT_MAX);
            break;
        case 11: // perfect dodge
            bonus = status.flee2 + val * 10;
            status.flee2 = cap_value(bonus, SHRT_MIN, SHRT_MAX);
            break;
        case 12: // aspd%
            status.aspd_rate -= 10 * val;
            break;
        case 13: // flat max hp
            player.bonus.hp += val;
            break;
        case 14: // flat max sp
            player.bonus.sp += val;
            break;
        case 15: // max hp%
            player.hprate += val;
            break;
        case 16: // max sp%
            player.sprate += val;
            break;
        case 17: // flat atk
            status.batk += val;
            break;
        case 18: // flat def
            bonus = status.def + val;
            status.def = cap_value(bonus, DEFTYPE_MIN, DEFTYPE_MAX);
            break;
        case 19: // flat mdef
            bonus = status.mdef + val;
            status.mdef = cap_value(bonus, DEFTYPE_MIN, DEFTYPE_MAX);
            break;
        case 20: // weapon element
            status.rhw.ele = status.lhw.ele = val;
            break;
        case 22: // bypass defense class
            if(val == 1)
                player.indexed_bonus.ignore_def_class[CLASS.NORMAL] = 1;
            else {
                player.indexed_bonus.ignore_def_class[CLASS.NORMAL] = 1;
                player.indexed_bonus.ignore_def_class[CLASS.BOSS] = 1;
            }
            break;
        case 23: // ice pick effect
            player.indexed_bonus.def_ratio_atk_class[CLASS.NORMAL] = 1;
            player.indexed_bonus.def_ratio_atk_class[CLASS.BOSS] = 1;
            break;
        case 24: // player defense adjustment
            //player.def_rate += val;
            //player.def2_rate += val;
            break;
        case 25: // ranged damage bonus
            player.bonus.long_attack_atk_rate += val;
            break;
        case 26: // boss damage bonus
            player.indexed_bonus.addclass[CLASS.BOSS] += val;
            break;
        case 27: // size damage bonus
        case 28:
        case 29:
            player.indexed_bonus.addsize[type - 27] += val;
            break;
        case 30: // race damage bonus
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
            player.indexed_bonus.addrace[type - 30] += val;
            break;
        case 40: // element damage bonus
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
        case 48:
        case 49:
            player.indexed_bonus.addele[type - 40] += val;
            break;
        case 50: // race resistance bonus
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 58:
        case 59:
            player.indexed_bonus.subrace[type - 50] += val;
            break;
        case 60: // ele resistance bonus
        case 61:
        case 62:
        case 63:
        case 64:
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
            player.indexed_bonus.subele_script[type - 60] += val;
            break;
        case 70: // crit damage % bonus
            player.bonus.crit_atk_rate += val;
            break;
        case 71: // reflect melee damage %
            player.bonus.short_weapon_damage_return += val;
            break;
        case 72: // fixed cast time
            break;
        case 73: // cast time reduction
            player.castrate += val;
            break;
        case 74: // cast delay reduction
            player.bonus.delayrate += -val;
            break;
        case 75: // hp regen rate
            player.hprecov_rate += val;
            break;
        case 76: // sp regen rate
            player.sprecov_rate += val;
            break;
        case 77: // boss resistance
            player.indexed_bonus.subclass[CLASS.BOSS] += val;
            break;
        case 78: // ranged attack resistance
            player.bonus.long_attack_def_rate += val;
            break;
        case 79: // normal monster resistance
            player.indexed_bonus.subclass[CLASS.NORMAL] += val;
            break;
        case 80: // atk damage vs all
            player.indexed_bonus.addclass[CLASS.ALL] += val;
            break;
        case 81: // goblin race damage bonus
            player.indexed_bonus.addrace2[RC2.GOBLIN] += val;
            break;
        case 82: // kobold race damage bonus
            player.indexed_bonus.addrace2[RC2.KOBOLD] += val;
            break;
        case 83: // orc race damage bonus
            player.indexed_bonus.addrace2[RC2.ORC] += val;
            break;
        case 84: // golem race damage bonus
            player.indexed_bonus.addrace2[RC2.GOLEM] += val;
            break;
        case 85: // defense rate
            player.def_rate += val;
            break;
        case 86: // perfect hit%
            player.bonus.perfect_hit += val;
            break;
        case 87: // atk% (the one that actually increases atk) - not really used
            break;
        case 88: // flat matk
            player.bonus.ematk += val;
            break;
        case 89: // matk%
            player.matk_rate += val;
            break;
        case 91: // your heal effectiveness
            PlayerBonusItemBonus(player.skillheal, SKILL.AL_HEAL, val);
            break;
        case 92: // received heal effectiveness
            PlayerBonusItemBonus(player.skillheal2, SKILL.AL_HEAL, val);
            break;
        case 93: // more heal damage vs undead
            PlayerBonusItemBonus(player.skillatk, SKILL.AL_HEAL, val);
            break;
        case 94: // your sanctuary effectiveness
            PlayerBonusItemBonus(player.skillatk, SKILL.PR_SANCTUARY, val);
            break;
        case 95: // received sanctuary effectiveness
            PlayerBonusItemBonus(player.skillheal2, SKILL.PR_SANCTUARY, val);
            break;
        case 96: // sanctuary damage vs undead
            PlayerBonusItemBonus(player.skillatk, SKILL.PR_SANCTUARY, val);
            break;
        case 97: // your potion pitcher effectiveness
            PlayerBonusItemBonus(player.skillatk, SKILL.AM_POTIONPITCHER, val);
            break;
        case 98: // received potion pitcher effectiveness
            PlayerBonusItemBonus(player.skillheal2, SKILL.AM_POTIONPITCHER, val);
            break;
        case 99: // all outgoing heal power
            player.bonus.add_heal_rate += val;
            break;
        case 100: // all received heal power
            player.bonus.add_heal2_rate += val;
            break;
        case 110: // crit bonus vs race
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
            player.indexed_bonus.critaddrace[type - 110] += val;
            break;
        case 120: // increased exp vs race
        case 121:
        case 122:
        case 123:
        case 124:
        case 125:
        case 126:
        case 127:
        case 128:
        case 129:
            player.indexed_bonus.expaddrace[type - 120] += val;
            break;
        case 130: // chance to cause x status effect (not really relevant for calc)
        case 131:
        case 132:
        case 133:
        case 134:
        case 135:
        case 136:
        case 137:
        case 138:
        case 139:
        case 140:
        case 141:
        case 142:
        case 143:
        case 144:
        case 145:
        case 146:
        case 147:
        case 148:
        case 149:
            break;
        case 150: // status effect resistance
        case 151:
        case 152:
        case 153:
        case 154:
        case 155:
        case 156:
        case 157:
        case 158:
        case 159:
        case 160:
        case 161:
        case 162:
        case 163:
        case 164:
        case 165:
        case 166:
        case 167:
        case 168:
        case 169:
            PlayerBonusItemBonus(player.reseff, type - 150, val);
            break;
        case 170: // magic damage bonus vs race
        case 171:
        case 172:
        case 173:
        case 174:
        case 175:
        case 176:
        case 177:
        case 178:
        case 179:
            player.indexed_bonus.magic_addrace[type - 170] += val;
            break;
        case 180: // ignore defense vs race
        case 181:
        case 182:
        case 183:
        case 184:
        case 185:
        case 186:
        case 187:
        case 188:
        case 189:
            player.indexed_bonus.ignore_def_race[type - 180] = 1;
            break;
        case 190: // size resistance
        case 191:
        case 192:
            player.indexed_bonus.subsize[type - 190] += val;
            break;
        case 193: // unrefinable - not really a bonus
            break;
        case 194: // unbreakable - not really a bonus
            break;
        case 195: // two-handed staff - handed differently now
            break;
        case 196: // not relevant anymore - can replace
            break;
        case 198: // armor element
            status.def_ele = val;
            break;
        case 199: // flat aspd
            player.bonus.aspd_add -= 10 * val;
            break;
        case 200: // headgear location - not really a bonus
            break;
        case 209: // movement speed (doesn't stack with INC AGI)
            player.bonus.speed_rate = Math.min(player.bonus.speed_rate, -val);
            break;
        case 210: // movement speed (stacks with INC AGI) - not on any relevant items yet
            player.bonus.speed_add_rate -= val;
            break;
        case 220: // enable skill - not really a bonus
            break;
        case 221: // auto-cast skill - not really a bonus
            break;
        case 290: // all monsters ignore DEF%
            player.indexed_bonus.ignore_def_by_class[CLASS.ALL] += val;
            break;
        case 291: // normal monsters ignore DEF%
            player.indexed_bonus.ignore_def_by_class[CLASS.NORMAL] += val;
            break;
        case 292: // boss monsters ignore DEF%
            player.indexed_bonus.ignore_def_by_class[CLASS.BOSS] += val;
            break;
        case 295: // all monsters ignore MDEF%
            player.indexed_bonus.ignore_mdef_by_class[CLASS.ALL] += val;
            break;
        case 296: // normal monsters ignore MDEF%
            player.indexed_bonus.ignore_mdef_by_class[CLASS.NORMAL] += val;
            break;
        case 297: // boss monsters ignore MDEF%
            player.indexed_bonus.ignore_mdef_by_class[CLASS.BOSS] += val;
            break;
        case 300: // ignore def% vs race
        case 301: 
        case 302:
        case 303:
        case 304:
        case 305:
        case 306:
        case 307:
        case 308:
        case 309:
            player.indexed_bonus.ignore_def_by_race[type - 300] += val;
            break;
        case 310: // ignore mdef% vs race
        case 311:
        case 312:
        case 313:
        case 314:
        case 315:
        case 316:
        case 317:
        case 318:
        case 319:
            player.indexed_bonus.ignore_mdef_by_race[type - 310] += val;
            break;
        case 320: // crit damage% vs race - not used yet
        case 321:
        case 322:
        case 323:
        case 324:
        case 325:
        case 326:
        case 327:
        case 328:
        case 329:
            break;
        case 330: // resistance vs monster of x element
        case 331:
        case 332:
        case 333:
        case 334:
        case 335:
        case 336:
        case 337:
        case 338:
        case 339:
            player.indexed_bonus.subdefele[type - 330] += val;
            player.indexed_bonus.magic_subdefele[type - 330] += val;
            break;
        case 340: // magic damage vs element
        case 341:
        case 342:
        case 343:
        case 344:
        case 345:
        case 346:
        case 347:
        case 348:
        case 349:
            player.indexed_bonus.magic_addele_script[type - 340] += val;
            break;
        case 350: // magic size resistance
        case 351:
        case 352:
            player.indexed_bonus.magic_subsize[type - 350] += val;
            break;
        case 353: // magic vs boss
            player.indexed_bonus.magic_addclass[CLASS.BOSS] += val;
            break;
        case 354: // magic vs all
            player.indexed_bonus.magic_addclass[CLASS.ALL] += val;
            break;
        case 355: // increased auto attack damage
            player.bonus.normalatk_dmgrate += val;
            break;
        case 356: // magic vs size
        case 357:
        case 358:
            player.indexed_bonus.magic_addsize[type - 356] += val;
            break;
        case 360: // ignore mdef% vs element
        case 361:
        case 362:
        case 363:
        case 364:
        case 365:
        case 366:
        case 367:
        case 368:
        case 369:
            player.indexed_bonus.ignore_mdef_by_ele[type - 360] += val;
            break;
        case 370: // sp cost reduction
            player.dsprate += val;
            break;
        case 371: // damage reduction vs all
            player.indexed_bonus.subclass[CLASS.ALL] += val;
            break;
        case 372: // increased double attack
            player.bonus.double_add_rate += val;
            break;
        case 373: // increased melee atk
            player.bonus.short_attack_atk_rate += val;
            break;
        case 374: // increased soft def
            bonus = status.def2 + val;
            status.def2 = cap_value(bonus, SHRT_MIN, SHRT_MAX);
            break;
        case 375: // increased dmg vs wounded morroc
            PlayerBonusItemBonus(player.add_dmg, 495, val);
            PlayerBonusItemBonus(player.add_dmg, 496, val);
            break;
        case 376:
            player.bonus.near_attack_def_rate += val;
            break;
        case 380:
        case 381:
        case 382:
        case 383:
        case 384:
        case 385:
        case 386:
        case 387:
        case 388:
        case 389:
            player.indexed_bonus.magic_atk_ele[type - 380] += val;
            break;
        case 390: // resist all elements
            player.indexed_bonus.subele_script[ELE.MAX] += val;
            break;
        case 391: // resist all races
            player.indexed_bonus.subrace[RC.ALL] += val;
            break;
        case 392: // resist all sizes
            player.indexed_bonus.subsize[SZ.ALL] += val;
            break;
        case 400: // status effect extra damage
        case 401:
        case 402:
        case 403:
        case 404:
        case 405:
        case 406:
        case 407:
        case 408:
        case 409:
        case 410:
        case 411:
        case 412:
        case 413:
        case 414:
        case 415:
        case 416:
        case 417:
        case 418:
        case 419:
            PlayerBonusItemBonus(player.addstatus_dmg, type - 400, val);
            break;
        default:
            // special cases for 5000 - 6999 (skill damage increase)
            // and 7000 - 8999 (skill cast time reduction) can be handled here if needed
            if(type >= 5000 && type < 7000) {
                PlayerBonusItemBonus(player.skillatk, type - 5000, val);
            } else if(type >= 7000 && type < 9000) {
                PlayerBonusItemBonus(player.skillcastrate, type - 7000, val);
            }
            break;
    }
}

function PlayerBonusItemBonus(bonus, id, val) {
    for(const it of bonus) {
        if(it.id === id) {
            it.val += val;
            return;
        }
    }

    let entry = new ItemBonus(id, val);
    bonus.push(entry);
}

/**
 * Parse all item scripts and apply bonuses to the player object
 * This parses equipped items
 */
function ParseItemScripts() {
    // Parse regular equipment (weapon1, weapon2, head1-3, left, body, shoulder, shoes, acces1-2)
    for (let slot = 0; slot < EQI.MAX; slot++) {
        const itemId = player.equip[slot];
        if (!itemId || !m_Item[itemId]) continue;
        
        const item = m_Item[itemId];
        
        // Parse item effects starting at index 11
        // Format: [effectId, value, effectId, value, ..., 0]
        for (let i = 11; item[i] !== 0 && item[i] !== undefined; i += 2) {
            const effectId = item[i];
            const value = item[i + 1];
            
            if (effectId && value !== undefined) {
                PlayerApplyBonus(effectId, value);
            }
        }
    }
    
    // Parse item combos — player.equip[EQI.MAX..20] contains active combo item IDs
    // populated by populateEquipCombos() in PopulatePlayerData
    for (let i = EQI.MAX; i < player.equip.length; i++) {
        const comboItemId = player.equip[i];
        if (!comboItemId || !m_Item[comboItemId]) continue;
 
        for (let j = 11; m_Item[comboItemId][j] !== 0 && m_Item[comboItemId][j] !== undefined; j += 2) {
            const effectId = m_Item[comboItemId][j];
            const value = m_Item[comboItemId][j + 1];
            // Skip effect 90 (combo marker, not a real bonus)
            if (effectId && effectId !== 90 && value !== undefined) {
                PlayerApplyBonus(effectId, value);
            }
        }
    }

    if(player.arrow == 16) // added check for Holy Arrow's demon bonus
        PlayerApplyBonus(36, 5);
}

/**
 * Parse additional scripts from cards, pets, temporary effects, and random options
 * This applies bonuses that aren't part of regular equipment
 */
function ParseAdditionalScripts() {
    // Parse card effects (26 card slots: weapon1(4), weapon2(4), head1, head2, shield, body, shoulder, shoes, acces1, acces2)
    for (let slot = 0; slot < 26; slot++) {
        const cardId = player.card[slot];
        if (!cardId || !m_Card[cardId]) continue;
        
        // Card effects start at index 4
        // Format: [effectId, value, effectId, value, ..., 0]
        for (let i = 4; m_Card[cardId][i] !== 0 && m_Card[cardId][i] !== undefined; i += 2) {
            const effectId = Math.abs(m_Card[cardId][i]);
            const value = m_Card[cardId][i + 1];
            
            if (effectId && value !== undefined) {
                PlayerApplyBonus(effectId, value);
            }
        }
    }
    
    // Parse pet effects
    const petId = player.pet;
    if (petId && m_PET[petId]) {
        // Pet effects start at index 3
        // Format: [effectId, value, effectId, value, ..., 0]
        for (let i = 3; m_PET[petId][i] !== 0 && m_PET[petId][i] !== undefined; i += 2) {
            const effectId = Math.abs(m_PET[petId][i]);
            const value = m_PET[petId][i + 1];
            
            if (effectId && value !== undefined) {
                PlayerApplyBonus(effectId, value);
            }
        }
    }
    
    // Parse temporary effects (up to 4 slots)
    const seenTempEffects = new Set();
    
    for (let i = 0; i <= 3; i++) {
        const tempEffectId = player.temp_effect[i];
        
        // Skip if 0, not found, or already processed (duplicate)
        if (!tempEffectId || !m_TempEffect[tempEffectId] || seenTempEffects.has(tempEffectId)) {
            continue;
        }
        
        seenTempEffects.add(tempEffectId);
        
        // Temp effect bonuses start at index 5
        // Format: [effectId, value, effectId, value, ..., 0]
        for (let j = 5; m_TempEffect[tempEffectId][j] !== 0 && m_TempEffect[tempEffectId][j] !== undefined; j += 2) {
            const effectId = Math.abs(m_TempEffect[tempEffectId][j]);
            const value = m_TempEffect[tempEffectId][j + 1];
            
            if (effectId && value !== undefined) {
                PlayerApplyBonus(effectId, value);
            }
        }
    }

    for(let i = 0; i < player.manual_edits.length; i++) {
        let type = player.manual_edits[i].type;
        let value = player.manual_edits[i].value;

        if(type == 73)
            value = -value;

        if(type && value) {
            PlayerApplyBonus(type, value);
        }
    }
    
    // Parse random options (32 slots total, paired as option_id + value)
    for (let i = 0; i <= 30; i += 2) {
        const optionId = player.randopt[i];
        const optionValue = player.randopt[i + 1];
        
        if (!optionId || !m_RandomOpt[optionId]) continue;
        
        const effectId = m_RandomOpt[optionId][2];
        
        if (!effectId) continue;
        
        // Special handling for effects 73 and 370 (subtract instead of add)
        if (effectId === 73 || effectId === 370) {
            PlayerApplyBonus(effectId, -optionValue);
        } else {
            PlayerApplyBonus(effectId, optionValue);
        }
    }
}

function CalculateEquipmentBonuses() {
    ParseItemScripts();

    let status = player.base_status;
    let bonus;

    // stat calculations
    if(player.equip[EQI.HAND_R] == 649) // berserk guitar
        PlayerApplyBonus(STAT.DEX + 1, player.status.dex);
    if(player.equip[EQI.HAND_R] == 1671) // kronos
        PlayerApplyBonus(STAT.INT + 1, Math.floor(player.refine[EQI.HAND_R] / 2));
    if(player.equip[EQI.HEAD_TOP] == 672 && n_A_JobClass() == JOB.TAEKWON) // magistrate hat
        PlayerApplyBonus(STAT.AGI + 1, 1);
    if(player.equip[EQI.HEAD_TOP] == 673 && n_A_JobClass() == JOB.TAEKWON) // ayam
        PlayerApplyBonus(STAT.INT + 1, 1);
    if(player.equip[EQI.HEAD_TOP] == 675 && n_A_JobClass() == JOB.TAEKWON) // bride mask
        PlayerApplyBonus(STAT.LUK + 1, 2);
    if(player.equip[EQI.HEAD_TOP] == 676 && n_A_JobClass() == JOB.TAEKWON) // mythical lion mask
        PlayerApplyBonus(STAT.DEX + 1, 2);
    if(player.equip[EQI.HEAD_MID] == 678 && n_A_JobClass() == JOB.TAEKWON) // hahoe mask
        PlayerApplyBonus(STAT.LUK + 1, 1);
    if(player.equip[EQI.HAND_R] == 1171 && SkillSearch(SKILL.SA_DRAGONOLOGY) >= 5) // staff of bordeaux
        PlayerApplyBonus(STAT.INT + 1, 3);
    if(player.equip[EQI.HAND_R] == 1168 && player.refine[EQI.HAND_R] >= 6) // dead tree cane staff
        PlayerApplyBonus(STAT.INT + 1, player.refine[EQI.HAND_R] - 5);
    if(player.equip[EQI.SHOES] == 717 && player.refine[EQI.SHOES] >= 9) // black leather boots
        PlayerApplyBonus(STAT.AGI + 1, 2);
    if(player.equip[EQI.HEAD_TOP] == 1880 && player.refine[EQI.HEAD_TOP] >= 9) // ascendent crown
        PlayerApplyBonus(7, 5); // all stats +5
    if(player.equip[EQI.HEAD_TOP] == 1894) // aegirnion helm
        PlayerApplyBonus(STAT.STR + 1, Math.trunc(player.refine[EQI.HEAD_TOP] / 3)); 

    // flat atk calculations
    if(EquipNumSearch(1120) > 0 && n_A_JobClass() == JOB.ARCHER) // archer figure
        status.batk += 10 * EquipNumSearch(1120);
    if(player.equip[EQI.HEAD_TOP] == 676 && n_A_JobClass() == JOB.TAEKWON) // mythical lion mask
        status.batk += player.refine[EQI.HEAD_TOP] * 2;
    if(player.equip[EQI.HAND_R] == 1165) // veteran axe
        status.batk += 20 * SkillSearch(SKILL.BS_VETERANAXE_MASTERY) + Math.floor(player.status.luk / 2) + Math.floor(player.status.dex / 3);
    if(EquipNumSearch(442) > 0 && player.status.agi >= 90) // rogue's treasure
        status.batk += 10 * EquipNumSearch(442);
    if(player.equip[EQI.HAND_R] == 621 && player.status.str >= 95) // doom slayer
        status.batk += 340;
    if(player.equip[EQI.HAND_R] == 1160 && player.status.str >= 95) // krasnaya
        status.batk += 20;
    if(player.equip[EQI.HAND_R] == 1164 && player.status.luk >= 90) // vecer axe
        status.batk += 20;
    if(player.equip[EQI.HEAD_TOP] == 953) // gigantic majestic goat
        status.batk += Math.floor((2 * player.status.job_level) / 7);

    // max hp calculations
    if(EquipNumSearch(1116) > 0 && n_A_JobClass() == JOB.NOVICE) // novice figure
        player.bonus.hp += 30 * EquipNumSearch(1116);
    if(player.equip[EQI.SHOES] == 836) // diabolus boots
        player.bonus.hp += 10 * player.status.base_level;
    if(player.equip[EQI.ARMOR] == 859) // brynhild
        player.bonus.hp += 20 * player.status.base_level;
    if(player.equip[EQI.ARMOR] == 986) // chameleon armor
        player.bonus.hp += 7 * player.status.base_level;
    if(CardNumSearch(225) > 0 && player.refine[EQI.ARMOR] >= 9) // apocalypse card
        player.bonus.hp += 800;
    if(player.equip[EQI.HAND_R] == 1168 && player.refine[EQI.HAND_R] >= 6) // dead tree cane staff
        player.bonus.hp -= 200 * (player.refine[EQI.HAND_R] - 5);
    if(player.equip[EQI.HEAD_TOP] == 955) // mandragora cap
        player.bonus.hp += 50 * player.refine[EQI.HEAD_TOP];
    if(player.equip[EQI.SHOES] == 536 && (n_A_JobClass() == JOB.MAGICIAN || n_A_JobClass() == JOB.ARCHER || n_A_JobClass() == JOB.ACOLYTE)) // valkyrie shoes
        player.bonus.hp += 5 * player.status.base_level;
    if(player.equip[EQI.HEAD_TOP] == 1880 && player.refine[EQI.HEAD_TOP] >= 7) // ascendant crown
        player.bonus.hp += 1000;

    // max hp % calculations
    if(player.equip[EQI.SHOES] == 715) // variant shoes
        player.hprate -= player.refine[EQI.SHOES];
    
    // flat max sp calculations
    if(EquipNumSearch(1118) > 0 && n_A_JobClass() == JOB.ACOLYTE) // acolyte figure
        player.bonus.sp += 50 * EquipNumSearch(1118);
    if(player.equip[EQI.ARMOR] == 859) // brynhild
        player.bonus.sp += 5 * player.status.base_level;
    if(player.equip[EQI.ARMOR] == 986) // chameleon armor
        player.bonus.sp += Math.floor(player.status.base_level / 2);
    if(player.equip[EQI.HAND_R] == 1671) // kronos
        player.bonus.sp += 50 * Math.floor(player.refine[EQI.HAND_R] / 2);
    if(player.equip[EQI.GARMENT] == 1193) // nydhorgg's shadow garb
        player.bonus.sp += Math.floor(player.status.base_level / 3) + 10 * player.refine[EQI.GARMENT];
    if(player.equip[EQI.HAND_R] == 642 && player.refine[EQI.HAND_R] >= 9) // lich's bone wand
        player.bonus.sp += 300;
    if(player.equip[EQI.HAND_R] == 1168 && player.refine[EQI.HAND_R] >= 6) // dead tree cane staff
        player.bonus.sp -= 100 * (player.refine[EQI.HAND_R] - 5);
    if(player.equip[EQI.SHOES] == 536 && (n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.THIEF || n_A_JobClass() == JOB.MERCHANT)) // valkyrie shoes
        player.bonus.sp += 2 * player.status.job_level;
    if(player.equip[EQI.HEAD_TOP] == 1880 && player.refine[EQI.HEAD_TOP] >= 7) // ascendant crown
        player.bonus.sp += 100;

    // max sp % calculations
    if(player.equip[EQI.SHOES] == 715) // variant shoes
        player.sprate -= player.refine[EQI.SHOES];

    // flat def calculations
    if(player.equip[EQI.HAND_R] == 521) { // luna bow
        bonus = 0;
        if(player.refine[EQI.HAND_R] >= 6)
            bonus += 3;
        if(player.refine[EQI.HAND_R] >= 9)
            bonus += 2;
        status.def += bonus;
    }
    if(EquipNumSearch(1117) && n_A_JobClass() == JOB.SWORDMAN) // swordsman figure
        status.def += 2 * EquipNumSearch(1117);
    if(player.equip[EQI.HAND_R] == 658) // gate keeper-dd
        status.def += player.refine[EQI.HAND_R];
    if(player.equip[EQI.SHOES] == 715) // variant shoes
        status.def += Math.floor(player.refine[EQI.SHOES] / 2);
    if(player.equip[EQI.HAND_R] == 942) // cardo
        status.def += Math.floor(player.refine[EQI.HAND_R] / 2);
    if(EquipNumSearch(764)) // friggs circlet + valk shield combo
        status.def -= player.refine[EQI.HEAD_TOP] + player.refine[EQI.SHIELD];
    if(EquipNumSearch(742) && n_A_JobClass() == JOB.SWORDMAN) // odin blessing + magnis cap + stone buckler combo
        status.def += 6;
    if(player.equip[EQI.ARMOR] == 986 && (n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.MERCHANT || n_A_JobClass() == JOB.THIEF)) // chameleon armor
        status.def += 3;
    if(TimeItemNumSearch(8)) // ulfhedinn temp effect
        status.def += 20;
    if(TimeItemNumSearch(19)) // mithril magic cape
        status.def -= 20;
    if(player.equip[EQI.HEAD_TOP] == 351) // lif doll hat
        status.def -= player.refine[EQI.HEAD_TOP];

    // flat mdef calculations
    if(EquipNumSearch(764)) // friggs circlet + valk shield combo
        status.mdef += player.refine[EQI.HEAD_TOP] + player.refine[EQI.SHIELD];
    if(player.equip[EQI.HAND_R] == 1169) // la'cryma stick
        status.mdef += player.refine[EQI.HAND_R];
    if(player.equip[EQI.HEAD_TOP] == 809) // leaf cat hat
        status.mdef += player.refine[EQI.HEAD_TOP];
    if(player.equip[EQI.ARMOR] == 986 && (n_A_JobClass() == JOB.ACOLYTE || n_A_JobClass() == JOB.ARCHER || n_A_JobClass() == JOB.MAGICIAN)) // chameleon armor
        status.mdef += 5;
    if(TimeItemNumSearch(8)) // ulfhedinn temp effect
        status.mdef -= 20;
    if(TimeItemNumSearch(19)) // mithril magic cape
        status.mdef += 20;
    if(player.equip[EQI.HEAD_TOP] == 351) // lif doll hat
        status.mdef += player.refine[EQI.HEAD_TOP];

    // flat hit calculations
    if(EquipNumSearch(1005) > 0 && EquipNumSearch(442)) // rogues treasure + black cat combo
        status.hit += Math.floor(player.refine[EQI.HAND_R] / 2);
    if(player.equip[EQI.HAND_R] == 1176 && SkillSearch(SKILL.AS_KATAR) == 10) // chakram
        status.hit += 10;

    // flat flee calculations
    if(player.equip[EQI.HAND_R] == 483) // bloody roar
        status.flee -= player.status.agi + player.status.base_level;
    if(EquipNumSearch(442) && player.status.str >= 90) // rogues treasure
        status.flee += 10 * EquipNumSearch(442);
    if(TimeItemNumSearch(1)) // isilla temp effect
        status.flee += 30 * TimeItemNumSearch(1);

    // flat perfect dodge calculations
    if(player.equip[EQI.GARMENT] == 535 && (n_A_JobClass() == JOB.MAGICIAN || n_A_JobClass() == JOB.ARCHER || n_A_JobClass() == JOB.ACOLYTE)) // valk manteau
        status.flee2 += (player.refine[EQI.GARMENT] * 2) * 10;
    if(player.equip[EQI.HEAD_MID] == 678 && n_A_JobClass() == JOB.TAEKWON) // hahoe mask
        status.flee2 += 2 * 10;

    // flat crit calculations
    if(EquipNumSearch(1122) > 0 && n_A_JobClass() == JOB.MERCHANT) // merchant figure
        status.cri += 50 * EquipNumSearch(1122);
    if(player.equip[EQI.ARMOR] == 689) // sniping suit
        status.cri += Math.floor(player.status.luk / 10) * 10;
    if(player.equip[EQI.HAND_R] == 623) // heart breaker
        status.cri += player.refine[EQI.HAND_R] * 10;
    if(player.equip[EQI.HAND_R] == 1161) // veteran hammer
        status.cri += (2 * SkillSearch(SKILL.PR_MACEMASTERY)) * 10;
    if(player.equip[EQI.HEAD_TOP] == 1823) { // mercury riser
        bonus = 0;
        if(player.refine[EQI.HEAD_TOP] >= 7)
            bonus += 20;
        if(player.refine[EQI.HEAD_TOP] >= 9)
            bonus += 20;
        status.cri += bonus;
    }
    if(EquipNumSearch(442) > 0 && player.status.agi >= 90) // rogue's treasure
        status.cri += (10 * EquipNumSearch(442)) * 10;
    if(player.equip[EQI.HAND_R] == 1164 && player.status.luk >= 90) // vecer axe
        status.cri += 50;
    if(player.equip[EQI.HEAD_TOP] == 675 && n_A_JobClass() == JOB.TAEKWON) // bride mask
        status.cri += 50;

    // flat matk calculations
    if(EquipNumSearch(1493) > 0) // skull cap + weapon combo
        player.bonus.ematk += 10 * player.refine[EQI.HAND_R];
    if(player.equip[EQI.HAND_R] == 1903) // metallic whip
        player.bonus.ematk += 15 * player.refine[EQI.HAND_R];
    if(player.equip[EQI.HAND_R] == 1918) // trumpet shell
        player.bonus.ematk += 15 * player.refine[EQI.HAND_R];
    
    // matk% calculations
    if(player.equip[EQI.HAND_R] == 646) // staff of destruction
        player.matk_rate += Math.floor(player.refine[EQI.HAND_R] / 2);
    if(player.equip[EQI.HAND_R] == 1173) // dea staff
        player.matk_rate += Math.floor(player.refine[EQI.HAND_R] / 2);
    if(EquipNumSearch(737) > 0) // survivors rod combo
        player.matk_rate += player.refine[EQI.HAND_R];
    if(EquipNumSearch(1042) > 0) // gentleman set
        player.matk_rate += player.refine[EQI.HAND_R];
    if(player.equip[EQI.HAND_R] == 484 && player.status.int >= 70) // sages diary
        player.matk_rate += 5;
    if(player.equip[EQI.HEAD_TOP] == 1492) { // skull cap
        bonus = 0;
        if(player.refine[EQI.HEAD_TOP] >= 5)
            bonus += 3;
        if(player.refine[EQI.HEAD_TOP] >= 7)
            bonus += 3;
        player.matk_rate += bonus;
    }
    if(player.equip[EQI.HEAD_TOP] == 565 && player.refine[EQI.HEAD_TOP] >= 7) // dress hat
        player.matk_rate += 1;
    if(player.equip[EQI.HAND_R] == 642 && player.refine[EQI.HAND_R] >= 9) // lich's bone wand
        player.matk_rate += 3;
    if(player.equip[EQI.HEAD_TOP] == 1879) // tam
        player.matk_rate += Math.trunc(player.refine[EQI.HEAD_TOP] / 2);
    if(player.equip[EQI.HAND_R] == 1903 && player.refine[EQI.HAND_R] >= 7) // metallic whip
        player.matk_rate += 15;
    if(player.equip[EQI.HAND_R] == 1918 && player.refine[EQI.HAND_R] >= 7) // trumpet shell
        player.matk_rate += 15;
    if(EquipNumSearch(1917) > 0 && n_A_JobClass() == JOB.NOVICE)
        player.matk_rate += 10;
    
    // speed calculation
    if(EquipNumSearch(763) > 0) // eagle wing + wing staff
        player.bonus.speed_rate = Math.min(player.bonus.speed_rate, -25);

    // aspd% calculations
    if(player.equip[EQI.HAND_R] == 624) // hurricane fury
        status.aspd_rate -= (player.refine[EQI.HAND_R]) * 10;
    if(player.equip[EQI.HAND_R] == 641) // ledger of death
        status.aspd_rate -= (player.refine[EQI.HAND_R]) * 10;
    if(player.equip[EQI.HAND_R] == 654) // wasteland's outlaw
        status.aspd_rate -= (Math.floor(player.status.agi / 14)) * 10;
    if(player.equip[EQI.HAND_R] == 484 && player.status.str >= 50) // sages diary
        status.aspd_rate -= 5 * 10;
    if(player.equip[EQI.HAND_R] == 944 && player.status.str >= 77) // lunakaligo
        status.aspd_rate -= 4 * 10;
    if(player.equip[EQI.HAND_R] == 621 && player.status.str >= 95) // doom slayer
        status.aspd_rate -= (-40) * 10;
    if(player.equip[EQI.HAND_R] == 1167 && player.status.str >= 95) // giant axe
        status.aspd_rate -= 3 * 10;
    if(EquipNumSearch(855) > 0 && player.status.job_id == JOB.LORD_KNIGHT) // tournament shield system set
        status.aspd_rate -= (-5) * 10;
    if(EquipNumSearch(1121) > 0 && n_A_JobClass() == JOB.THIEF) // thief figure
        status.aspd_rate -= (3 * EquipNumSearch(1121)) * 10;
    if(EquipNumSearch(1004) > 0) // cold heart set
        status.aspd_rate -= (Math.floor(player.refine[EQI.HAND_R] / 2)) * 10;
    if(player.equip[EQI.HEAD_TOP] == 1823) { // mercury riser
        bonus = 0;
        if(player.refine[EQI.HEAD_TOP] >= 7)
            bonus += 2;
        if(player.refine[EQI.HEAD_TOP] >= 9)
            bonus += 2;
        status.aspd_rate -= bonus * 10;
    }
    
    // cast time calculations
    if(EquipNumSearch(750) > 0) // spiritual ring + staff combo
        player.castrate += -(player.refine[EQI.HAND_R]);
    if(EquipNumSearch(1006) > 0) // black cat set
        player.castrate += -(Math.floor(player.refine[EQI.HAND_R] / 2));
    if(EquipNumSearch(1493) > 0 && player.refine[EQI.HAND_R] == 10) // skull cap + weapon combo
        player.castrate += -10;

    // skill specific cast time calculations
    if(player.equip[EQI.HAND_R] == 1169 && player.refine[EQI.HAND_R] == 10) // la'cryma stick
        PlayerBonusItemBonus(player.skillcastrate, SKILL.WZ_STORMGUST, -8);
    
    // after cast delay calculations
    if(player.equip[EQI.HAND_R] == 936) // thorn staff of darkness
        player.bonus.delayrate += -(Math.floor(3 * player.refine[EQI.HAND_R] / 2));
    if(player.equip[EQI.HAND_R] == 934 && player.refine[EQI.HAND_R] >= 9) // tae goo lynn
        player.bonus.delayrate += -20;
    if(TimeItemNumSearch(29) > 0) // rata temp effect
        player.bonus.delayrate += -20 * TimeItemNumSearch(29);
    if(EquipNumSearch(1917) > 0 && n_A_JobClass() == JOB.NOVICE)
        player.bonus.delayrate += -10;

    // % hp regen calculations
    if(player.equip[EQI.HEAD_TOP] == 672 && n_A_JobClass() == JOB.TAEKWON) // magistrate hat
        player.hprecov_rate += 3;

    // % sp regen calculations
    if(player.equip[EQI.HEAD_TOP] == 672 && n_A_JobClass() == JOB.TAEKWON) // magistrate hat
        player.sprecov_rate += 3;

    // crit damage calculations

    // long range atk calculations
    if(player.equip[EQI.HAND_R] == 626 && player.arrow == 2) // burning bow + fire arrow combo
        player.bonus.long_attack_atk_rate += 25;
    if(player.equip[EQI.HAND_R] == 627 && player.arrow == 5) // frozen bow + crystal arrow combo
        player.bonus.long_attack_atk_rate += 25;
    if(player.equip[EQI.HAND_R] == 628 && player.arrow == 4) // earth bow + stone arrow combo
        player.bonus.long_attack_atk_rate += 25;
    if(player.equip[EQI.HAND_R] == 629 && player.arrow == 6) // gust bow + wind arrow combo
        player.bonus.long_attack_atk_rate += 25;
    if(player.equip[EQI.HAND_R] == 630 && player.arrow == 10) // orc archer bow + steel arrow combo
        player.bonus.long_attack_atk_rate += 25;

    // outgoing healing calculations
    if(player.equip[EQI.HAND_R] == 1161) // veteran hammer
        player.bonus.add_heal_rate += SkillSearch(SKILL.AL_DP);
    if(player.equip[EQI.HEAD_TOP] == 1768 && player.refine[EQI.HEAD_TOP] >= 7) // benevolent guardian
        player.bonus.add_heal_rate += 3;
    if(EquipNumSearch(1769) > 0) // benevolent healing set
        player.bonus.add_heal_rate += player.refine[EQI.HAND_R];
    if(EquipNumSearch(1770) > 0) // benevolent holy set
        player.bonus.add_heal_rate += 3 * player.refine[EQI.HAND_R];
    if(player.equip[EQI.HAND_R] == 644) // healing staff
        player.bonus.add_heal_rate += Math.floor((player.refine[EQI.HAND_R] * 3) / 2);
    if(player.equip[EQI.HEAD_TOP] == 565 && player.refine[EQI.HEAD_TOP] >= 7) // dress hat
        player.bonus.add_heal_rate += 1;
    if(player.equip[EQI.SHIELD] == 1881 && player.refine[EQI.SHIELD] >= 9) // rosa shield
        player.bonus.add_heal_rate += 5;

    // elemental reduction calculations
    if(EquipNumSearch(737)) // survivior rod combo
        player.indexed_bonus.subele[ELE.NEUTRAL] += player.refine[EQI.GARMENT] * 3;

    // atk% calculations
    if(player.equip[EQI.HEAD_TOP] == 565 && player.refine[EQI.HEAD_TOP] >= 7) // dress hat
        player.indexed_bonus.addclass[CLASS.ALL] += 1;

    // status resistance calculations
    if(player.equip[EQI.ARMOR] == 534) { // valkyrie armor
        if(n_A_JobClass() == JOB.MAGICIAN || n_A_JobClass() == JOB.ARCHER || n_A_JobClass() == JOB.ACOLYTE)
            PlayerBonusItemBonus(player.reseff, EFF.SILENCE, 50);
        else if(n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.THIEF)
            PlayerBonusItemBonus(player.reseff, EFF.STUN, 50);
    }
    if(player.equip[EQI.HEAD_TOP] == 828) { // dark bacilicum
        PlayerBonusItemBonus(player.reseff, EFF.STONE, player.refine[EQI.HEAD_TOP] * 2);
        PlayerBonusItemBonus(player.reseff, EFF.FREEZE, player.refine[EQI.HEAD_TOP] * 2);
        PlayerBonusItemBonus(player.reseff, EFF.STUN, player.refine[EQI.HEAD_TOP] * 2);
    }
    
    // magic def pierce calculations
    if(player.equip[EQI.HAND_R] == 645) // piercing staff
        player.indexed_bonus.ignore_mdef_by_class[CLASS.ALL] += 10 + player.refine[EQI.HAND_R];
    if(player.equip[EQI.HAND_R] == 936) // thorn staff of darkness
        player.indexed_bonus.ignore_mdef_by_class[CLASS.ALL] += player.refine[EQI.HAND_R];
    
    // reflect damage back calculations
    if(player.equip[EQI.GARMENT] == 535 && (n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.THIEF || n_A_JobClass() == JOB.MERCHANT)) // valkyrie manteau
        player.bonus.short_weapon_damage_return += 5 + player.refine[EQI.GARMENT] * 2;
    if(TimeItemNumSearch(28) > 0) // shield of naga temp effect
        player.bonus.short_weapon_damage_return += 3 * player.refine[EQI.SHIELD];
    
    // skill specific damage bonus calculations
    if(player.equip[EQI.HAND_R] == 1169) // la'cryma stick
        PlayerBonusItemBonus(player.skillatk, SKILL.WZ_STORMGUST, player.refine[EQI.HAND_R]);
    if(player.equip[EQI.HAND_R] == 1164 && player.status.luk >= 90 && player.status.dex >= 90) // vecer axe
        PlayerBonusItemBonus(player.skillatk, SKILL.MC_MAMMONITE, 15);

    if(player.equip[EQI.HEAD_TOP] == 1878 && player.refine[EQI.HEAD_TOP] >= 9) // shrine maiden hat
        PlayerBonusItemBonus(player.skillatk, SKILL.PR_MAGNUS, 10);
}

function CalculateAdditionalBonuses() {
    ParseAdditionalScripts();

    let status = player.base_status;
    let bonus;

    // stat calculations
    if(CardNumSearch(466) > 0 && player.weapontype1 == WEAPON.ROD) // necromancer card
        PlayerApplyBonus(STAT.INT + 1, CardNumSearch(466));
    if(CardNumSearch(513) > 0 && n_A_JobClass2() == JOB.PRIEST) // rhyncho card
        PlayerApplyBonus(STAT.INT + 1, 1);
    if(CardNumSearch(383) > 0 && n_A_JobClass() == JOB.ACOLYTE) // rideword card
        PlayerApplyBonus(STAT.INT + 1, CardNumSearch(383));
    if(player.card[8] == 540 && n_A_JobClass() == JOB.ARCHER) // dolomedes card on top headgear
        PlayerApplyBonus(STAT.DEX + 1, Math.floor(player.refine[EQI.HEAD_TOP] / 3));
    if(player.card[8] == 180) // seyren windsor card on top headgear
        PlayerApplyBonus(STAT.STR + 1, player.refine[EQI.HEAD_TOP]);
    if(CardNumSearch(173) > 0) // despero card
        PlayerApplyBonus(STAT.INT + 1, player.refine[EQI.SHIELD]);
    if(CardNumSearch(198) > 0) // dimik card
        PlayerApplyBonus(STAT.VIT + 1, player.refine[EQI.ARMOR]);
    if(CardNumSearch(402) > 0) // chung e card
        PlayerApplyBonus(STAT.LUK + 1, player.refine[EQI.GARMENT]);
    if(CardNumSearch(406) > 0) // odium card
        PlayerApplyBonus(STAT.AGI + 1, player.refine[EQI.SHOES]);
    if(CardNumSearch(185) > 0) // obsidian card
        PlayerApplyBonus(STAT.VIT + 1, Math.floor(player.status.dex / 18));
    if(CardNumSearch(187) > 0) // egnigem cenia card
        PlayerApplyBonus(STAT.STR + 1, Math.floor(player.status.int / 18));
    if(CardNumSearch(189) > 0) // venatu card
        PlayerApplyBonus(STAT.LUK + 1, Math.floor(player.status.agi / 18));
    if(CardNumSearch(191) > 0) // ancient mimic card
        PlayerApplyBonus(STAT.AGI + 1, Math.floor(player.status.luk / 18));
    if(CardNumSearch(196) > 0) // mistress of shelter card
        PlayerApplyBonus(STAT.INT + 1, Math.floor(player.status.str / 18));
    if(CardNumSearch(197) > 0) // observation card
        PlayerApplyBonus(STAT.DEX + 1, Math.floor(player.status.vit / 18));
    if(CardNumSearch(405) > 0) { // aliot card
        bonus = 0; // represents the type of bonus aliot card gives
        if(n_A_JobClass() == JOB.ACOLYTE || n_A_JobClass() == JOB.MAGICIAN  || n_A_JobClass() == JOB.ARCHER)
            bonus = STAT.INT;
        else if(n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.THIEF || n_A_JobClass() == JOB.MERCHANT)
            bonus = STAT.STR;
        PlayerApplyBonus(bonus + 1, 2);
    }
    if(CardNumSearch(544) > 0 && n_A_JobClass() == JOB.MERCHANT) // wild rider
        PlayerApplyBonus(STAT.LUK + 1, Math.trunc(player.refine[EQI.HEAD_TOP] / 3));

    // flat atk calculations
    if(CardNumSearch(492) > 0) // ifrit card
        status.batk += Math.floor(player.status.job_level / 10) * CardNumSearch(492);
    if(CardNumSearch(267) > 0 && player.status.str >= 80) // giant whisper card
        status.batk += 20;
    if(player.card[11] == 543 && (player.equip[EQI.ARMOR] == 1888)) // siorava + malangdo armor
        status.batk += 10;


    // atk% calculations - this is the atk% that increases atk so not used 

    // flat max hp calculations
    if(CardNumSearch(474) > 0 && n_A_JobClass() == JOB.MAGICIAN) // banshee card
        player.bonus.hp -= 100 * CardNumSearch(474);
    if(CardNumSearch(477) > 0 && n_A_JobClass() == JOB.SWORDMAN) // echio card
        player.bonus.hp += 500 * CardNumSearch(477);
    if(CardNumSearch(186) > 0) // remover card
        player.bonus.hp -= 40 * player.refine[EQI.ARMOR];
    if(player.card[8] == 541 && (player.equip[EQI.HEAD_TOP] == 1886 || player.equip[EQI.HEAD_TOP] == 1892)) // pouring card + malangdo/red malangdo hat
        player.bonus.hp += 50;

    // max hp % calculations
    if(CardNumSearch(267) > 0 && player.status.vit >= 80) // giant whisper card
        player.hprate += 3;
    if(CardNumSearch(530) > 0) { // hardrock mammoth card
        bonus = 0;
        if(player.refine[EQI.ARMOR] >= 7)
            bonus += 10;
        if(player.refine[EQI.ARMOR] >= 9)
            bonus += 3;
        player.hprate += bonus;
    }
    if(CardNumSearch(304) > 0 && player.refine[EQI.SHOES] >= 9) // firelock soldier card
        player.hprate += 10;
    if(CardNumSearch(407) > 0 && player.refine[EQI.SHOES] <= 4) // gold acidus card
        player.hprate += 4;
    if(CardNumSearch(405) > 0 && (n_A_JobClass() == JOB.SWORDMAN || n_A_JobClass() == JOB.THIEF || n_A_JobClass() == JOB.MERCHANT)) // aliot card
        player.hprate += 5;
    if(CardNumSearch(550) > 0) // mutant coelacanth card
        player.hprate -= 1 * player.refine[EQI.HEAD_TOP];
    if(CardNumSearch(551) > 0) // violent coelacanth card
        player.hprate -= 1 * player.refine[EQI.HEAD_TOP];
    if(CardNumSearch(552) > 0) // gloomy coelacanth card
        player.hprate -= 1 * player.refine[EQI.HEAD_TOP];
    if(CardNumSearch(553) > 0) // weird coelacanth card
        player.hprate -= 1 * player.refine[EQI.HEAD_TOP];

    // flat max sp calculations
    if(player.card[9] == 179) // blue acidus card on mid headgear
        player.bonus.sp += 40;
    if(player.card[8] == 179 && player.refine[EQI.HEAD_TOP] <= 4) // blue acidus card on top headgear
        player.bonus.sp += 40;
    if(player.card[8] == 298 && player.refine[EQI.HEAD_TOP] >= 9) // carat card on top headgear
        player.bonus.sp += 150;
    if(CardNumSearch(474) > 0 && n_A_JobClass() == JOB.MAGICIAN) // banshee card
        player.bonus.sp += 100 * CardNumSearch(474);
    if(CardNumSearch(476) > 0 && n_A_JobClass() == JOB.MAGICIAN) // agav card
        player.bonus.sp += 100;
    if(player.card[8] == 541 && (player.equip[EQI.HEAD_TOP] == 1886 || player.equip[EQI.HEAD_TOP] == 1892)) // pouring card + malangdo/red malangdo hat
        player.bonus.sp += 30;

    // max sp % calculations
    if(CardNumSearch(304) > 0 && player.refine[EQI.SHOES] >= 9) // firelock soldier card
        player.sprate += 10;
    if(CardNumSearch(407) > 0 && player.refine[EQI.SHOES] <= 4) // gold acidus card
        player.sprate += 4;
    if(CardNumSearch(405) > 0 && (n_A_JobClass() == JOB.ACOLYTE || n_A_JobClass() == JOB.MAGICIAN  || n_A_JobClass() == JOB.ARCHER)) // aliot card
        player.sprate += 5;

    // flat def calculations

    if(CardNumSearch(222) > 0 && player.refine[EQI.SHIELD] <= 5) // arclouze card
        status.def += 2;
    if(CardNumSearch(283) > 0 && player.refine[EQI.ARMOR] <= 5) // goat card
        status.def += 2;
    if(CardNumSearch(392) > 0) // tao gunka card
        status.def -= 50;

    // flat mdef calculations

    if(CardNumSearch(383) > 0 && n_A_JobClass() == JOB.ACOLYTE) // rideword card
        status.mdef += CardNumSearch(383);
    if(player.card[9] == 213 && player.refine[EQI.HEAD_TOP] <= 5) // gibbet card top headgear
        status.mdef += 5;
    if(player.card[10] == 213) // gibbet card mid headgear
        status.mdef += 5;
    if(CardNumSearch(199) && n_A_JobClass() == JOB.MAGICIAN) // frus card
        status.mdef += 3;
    if(CardNumSearch(222) && player.refine[EQI.SHIELD] <= 5) // arclouze card
        status.mdef += 3;
    if(CardNumSearch(283) && player.refine[EQI.ARMOR] <= 5) // goat card
        status.mdef += 5;
    if(CardNumSearch(310) && player.refine[EQI.SHIELD] >= 9) // sting card
        status.mdef += 5;
    if(CardNumSearch(381) && player.refine[EQI.SHOES] <= 5) // megalith card
        status.mdef += 7;
    if(CardNumSearch(258) > 0) { // kapha card
        bonus = 0;
        if(player.refine[EQI.GARMENT] <= 5)
            bonus = 8;
        status.mdef += bonus;
    }
    if(CardNumSearch(392) > 0) // tao gunka card
        status.mdef -= 50;

    // flat hit calculations

    if(CardNumSearch(492) > 0) // ifrit card
        status.hit += Math.floor(player.status.job_level / 10) * CardNumSearch(492);
    if(CardNumSearch(465) > 0 && player.weapontype1 == WEAPON.BOW) // bow guardian card
        status.hit += 5 * CardNumSearch(465);

    // flat flee calculations
    if(CardNumSearch(295) > 0 && n_A_JobClass() == JOB.THIEF) // wanderer card
        status.flee += 20;
    if(CardNumSearch(271) > 0 && player.refine[EQI.GARMENT] >= 9) // nine tails card
        status.flee += 20;
    if(CardNumSearch(401) > 0) { // kavach icarus card
        if(player.refine[EQI.GARMENT] <= 4)
            status.flee += 20;
        else
            status.flee += 10;
    }
    if(CardNumSearch(403) > 0 && player.refine[EQI.GARMENT] >= 9) // orc baby card
        status.flee += 5;
    if(CardNumSearch(595) > 0) // baba yaga card
        status.flee += player.refine[EQI.SHOES] * 2;
    if(player.card[13] == 542 && (player.equip[EQI.SHOES] == 1890)) // red eruma + malangdo boots
        status.flee += 5;

    // perfect dodge calculations

    if(CardNumSearch(354) > 0 && n_A_JobClass() == JOB.SWORDMAN) // heater card
        status.flee2 += (3 * CardNumSearch(354)) * 10;
    if(CardNumSearch(391) > 0 && n_A_JobClass() == JOB.THIEF) // wild rose card
        status.flee2 += 5 * 10;
    if(CardNumSearch(401) > 0 && player.refine[EQI.GARMENT] <= 4) // kavach icarus card
        status.flee2 += 1 * 10;

    // flat crit calculations
    if(CardNumSearch(492) > 0) // ifrit card
        status.cri += (Math.floor(player.status.job_level / 10) * CardNumSearch(492) * 10);
    if(CardNumSearch(328) > 0 && n_A_JobClass() == JOB.THIEF) // mobster card
        status.cri += (4 * CardNumSearch(328)) * 10;
    if(CardNumSearch(465) > 0 && player.weapontype1 == WEAPON.BOW) // bow guardian card
        status.cri += (5 * CardNumSearch(465)) * 10;
    if(CardNumSearch(402) > 0) // chung e card
        status.cri += player.refine[EQI.GARMENT] * 10;
    if(CardNumSearch(532) > 0 && player.refine[EQI.HAND_R] >= 7) // tendrillion card
        status.cri += (5 * CardNumSearch(532)) * 10;
    if(CardNumSearch(267) > 0 && player.status.luk >= 80) // giant whisper card
        status.cri += 30;
    if(CardNumSearch(464) > 0 && player.weapontype1 == WEAPON.ONEHANDSWORD || player.weapontype1 == WEAPON.TWOHANDSWORD) // sword guardian card
        status.cri += 5 * CardNumSearch(464) * 10;
    if(CardNumSearch(253) > 0 && n_A_JobClass() == JOB.ACOLYTE) { // fur seal card
        player.indexed_bonus.critaddrace[RC.UNDEAD] += 90;
        player.indexed_bonus.critaddrace[RC.DEMON] += 90;
    }
    if(CardNumSearch(462) > 0) // drosera card
        player.bonus.critical_rangeatk += (15 * CardNumSearch(462)) * 10;
    if(CardNumSearch(550) > 0) // mutant coelacanth card
        status.cri += Math.trunc(player.refine[EQI.HEAD_TOP] / 2) * 10;

    // flat matk calculations
    if(player.card[11] == 543 && (player.equip[EQI.ARMOR] == 1888)) // siorava + malangdo armor
        player.bonus.ematk += 10;

    // matk% calculations
    if(CardNumSearch(553) > 0) // weird coelacanth card
        player.matk_rate += Math.trunc(player.refine[EQI.HEAD_TOP] / 2);

    // speed calculations
    if(CardNumSearch(451) > 0) // thief card set
        player.bonus.speed_rate = Math.min(player.bonus.speed_rate, -25);

    // aspd % calculations
    if(CardNumSearch(528) > 0 && (player.weapontype1 == WEAPON.BOW || (player.weapontype1 >= WEAPON.HUUMA && player.weapontype1 <= WEAPON.GRENADE))) // beholder master card
        status.aspd_rate -= (5 * CardNumSearch(528)) * 10;
    if(CardNumSearch(525) > 0 && player.weapontype1 == WEAPON.TWOHANDSWORD) // fanat card
        status.aspd_rate -= (5 * CardNumSearch(525)) * 10;

    // cast time calculations

    if(CardNumSearch(454) > 0 && n_A_JobClass() == JOB.MAGICIAN) // mage card set
        player.castrate += -15;
    if(CardNumSearch(460) > 0 && n_A_JobClass2() == JOB.SAGE) // sage card set
        player.castrate += -20;
    if(player.card[8] == 177) // kathryne keyron card
        player.castrate += -(player.refine[EQI.HEAD_TOP]);
    if(TimeItemNumSearch(1) > 0) // isilla temp effect
        player.castrate += (-50 * TimeItemNumSearch(1));

    // % hp regen calculations

    if(CardNumSearch(221) > 0 && player.status.luk >= 77) // arch angeling ard
        player.hprecov_rate += 100 * CardNumSearch(221);
    if(CardNumSearch(407) && player.refine[EQI.SHOES] <= 4) // gold acidus card
        player.hprecov_rate += 5;

    // % sp regen calculations
    
    if(CardNumSearch(221) > 0 && player.status.luk >= 77) // arch angeling ard
        player.sprecov_rate += 100 * CardNumSearch(221);
    if(CardNumSearch(407) && player.refine[EQI.SHOES] <= 4) // gold acidus card
        player.sprecov_rate += 5;
    if(player.card[8] == 179 && player.refine[EQI.HEAD_TOP] <= 4) // blue acidus card on top headgear
        player.sprecov_rate += 5;
    if(player.card[9] == 179) // blue acidus card on mid headgear
        player.sprecov_rate += 5;

    // misc calculations

    // long range attack calculations
    if(CardNumSearch(552) > 0) // gloomy coelacanth card
        player.bonus.long_attack_atk_rate += Math.trunc(player.refine[EQI.HEAD_TOP] / 2);

    // crit damage calculations
    if(CardNumSearch(532) > 0 && player.refine[EQI.HAND_R] >= 9) // tendrillion card
        player.bonus.crit_atk_rate += 10 * CardNumSearch(532);
    if(CardNumSearch(550) > 0) // mutant coelacanth card
        player.bonus.crit_atk_rate += Math.trunc(player.refine[EQI.HEAD_TOP] / 2);

    // elemental reduction calculations
    if(CardNumSearch(403) > 0 && player.refine[EQI.GARMENT] >= 9) // orc baby card
        player.indexed_bonus.subele[ELE.NEUTRAL] += 5;

    // atk% calculations
    if(CardNumSearch(479) && n_A_JobClass2() == JOB.STALKER) // byorgue card
        player.indexed_bonus.addclass[CLASS.ALL] += 10;
    if(CardNumSearch(551)) // violent coelacanth card
        player.indexed_bonus.addclass[CLASS.ALL] += Math.trunc(player.refine[EQI.HEAD_TOP] / 2);

    // subrace calculations

    if(CardNumSearch(452) > 0 && n_A_JobClass() == JOB.ACOLYTE) { // acolyte card set
        player.indexed_bonus.subrace[RC.UNDEAD] += 30;
        player.indexed_bonus.subrace[RC.DEMON] += 30;
    }

    // def pierce calculations

    // mdef pierce calculations
    if(CardNumSearch(466) > 0 && player.weapontype1 == WEAPON.ROD) // necromancer card
        player.indexed_bonus.ignore_mdef_by_class[CLASS.ALL] += 2 * CardNumSearch(466);
    if(CardNumSearch(425) > 0) // vesper card
        player.indexed_bonus.ignore_mdef_by_class[CLASS.BOSS] += 30 * CardNumSearch(425);

    // status resistance calculations

    if(CardNumSearch(176) > 0) { // gemini-s58 card
        if(player.status.agi >= 90) {
            PlayerBonusItemBonus(player.reseff, EFF.SILENCE, 30 * CardNumSearch(176));
            PlayerBonusItemBonus(player.reseff, EFF.STUN, 30 * CardNumSearch(176));
        }
        if(player.status.vit >= 80) {
            PlayerBonusItemBonus(player.reseff, EFF.STONE, 50 * CardNumSearch(176));
            PlayerBonusItemBonus(player.reseff, EFF.SLEEP, 50 * CardNumSearch(176));
        }
    }

    // magic damage ele% bonus
    if(CardNumSearch(546) > 0) { // shining seaweed
        bonus = 0;
        if(player.right_weapon.level <= 2)
            bonus = 4;
        else if(player.right_weapon.level >= 3)
            bonus = 8;
        player.indexed_bonus.magic_addele_script[ELE.WATER] += bonus * CardNumSearch(546);
    }
    if(SkillSearch(SKILL.SA_FROSTWEAPON) >= 5) {
        player.skillatk, [SKILL.SA_COLDBOLT_HINDSIGHT] + 10;
    }

    // magic atk ele bonus calculations

    // skill specific damage bonus calculations
    if(CardNumSearch(474) > 0 && n_A_JobClass() == JOB.MAGICIAN) { // banshee card
        PlayerBonusItemBonus(player.skillatk, SKILL.MG_SOULSTRIKE, 20 * CardNumSearch(474));
        PlayerBonusItemBonus(player.skillatk, SKILL.MG_NAPALMBEAT, 20 * CardNumSearch(474));
        PlayerBonusItemBonus(player.skillatk, SKILL.HW_NAPALMVULCAN, 20 * CardNumSearch(474));
    }
    if(CardNumSearch(493) > 0) // imp card
        PlayerBonusItemBonus(player.skillatk, SKILL.SA_FIREBOLT_HINDSIGHT, 25 * CardNumSearch(493));
    if(CardNumSearch(488) > 0) // siroma card
        PlayerBonusItemBonus(player.skillatk, SKILL.SA_COLDBOLT_HINDSIGHT, 25 * CardNumSearch(488));
    if(CardNumSearch(362) > 0 && player.refine[EQI.SHOES] >= 9) // freezer card
        PlayerBonusItemBonus(player.skillatk, SKILL.SM_BASH, 10);
    if(CardNumSearch(464) > 0 && (player.weapontype1 == WEAPON.ONEHANDSWORD || player.weapontype1 == WEAPON.TWOHANDSWORD)) // sword guardian card
        PlayerBonusItemBonus(player.skillatk, SKILL.KN_BOWLINGBASH, 25 * CardNumSearch(464));
    if(CardNumSearch(465) > 0 && player.weapontype1 == WEAPON.BOW) // bow guardian card
        PlayerBonusItemBonus(player.skillatk, SKILL.AC_SHOWER, 50 * CardNumSearch(465));
    if(CardNumSearch(523) && n_A_JobClass() == JOB.MERCHANT) // heavy metaling card
        PlayerBonusItemBonus(player.skillatk, SKILL.MC_CARTREVOLUTION, 50);

    // bonuses from "statuses" which have a script

    // stats
    if(sc_get(player, SC.FOOD_STR_CASH)) { // str food
        bonus = 0;
        const strFoods = [SC.FOOD_STR_CASH];
        for(const sc of strFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.str += bonus;
    }
    if(sc_get(player, SC.FOOD_AGI_CASH)) { // agi food
        bonus = 0;
        const agiFoods = [SC.FOOD_AGI_CASH];
        for(const sc of agiFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.agi += bonus;
    }
    if(sc_get(player, SC.FOOD_VIT_CASH)) { // vit food
        bonus = 0;
        const vitFoods = [SC.FOOD_VIT_CASH];
        for(const sc of vitFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.vit += bonus;
    }
    if(sc_get(player, SC.FOOD_INT_CASH)) { // int food
        bonus = 0;
        const intFoods = [SC.FOOD_INT_CASH];
        for(const sc of intFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.int += bonus;
    }
    if(sc_get(player, SC.FOOD_DEX_CASH)) { // dex food
        bonus = 0;
        const dexFoods = [SC.FOOD_DEX_CASH];
        for(const sc of dexFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.dex += bonus;
    }
    if(sc_get(player, SC.FOOD_LUK_CASH)) { // luk food
        bonus = 0;
        const lukFoods = [SC.FOOD_LUK_CASH];
        for(const sc of lukFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.luk += bonus;
    }

    // flat atk from foods
    if(sc_get(player, SC.ATKPOTION) || sc_get(player, SC.RESENTMENT_BOX) || sc_get(player, SC.RUNE_STRAWBERRY_CAKE)) {
        bonus = 0;
        const atkFoods = [SC.ATKPOTION, SC.RESENTMENT_BOX, SC.RUNE_STRAWBERRY_CAKE];
        for(const sc of atkFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.batk += bonus;
    }

    // flat matk from foods
    if(sc_get(player, SC.MATKPOTION) || sc_get(player, SC.DROWSINESS_BOX) || sc_get(player, SC.RUNE_STRAWBERRY_CAKE)) { // flat matk food
        bonus = 0;
        const matkFoods = [SC.MATKPOTION, SC.DROWSINESS_BOX, SC.RUNE_STRAWBERRY_CAKE];
        for(const sc of matkFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        player.bonus.ematk += bonus;
    }

    // flat hit from foods
    if(sc_get(player, SC.HITFOOD) || sc_get(player, SC.SCHWARTZWALD_PINE_JUBILEE)) {
        bonus = 0;
        const hitFoods = [SC.HITFOOD, SC.SCHWARTZWALD_PINE_JUBILEE];
        for(const sc of hitFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.hit += bonus;
    } 

    // flee food
    if(sc_get(player, SC.FLEEFOOD) || sc_get(player, SC.SCHWARTZWALD_PINE_JUBILEE)) {
        bonus = 0;
        const fleeFoods = [SC.FLEEFOOD, SC.SCHWARTZWALD_PINE_JUBILEE];
        for(const sc of fleeFoods) {
            const effect = sc_get(player, sc);
            let val1 = effect ? effect.val1 : 0;
            if(sc == SC.SCHWARTZWALD_PINE_JUBILEE)
                val1 = effect ? effect.val2 : 0;
            if(effect && val1 > bonus) bonus = val1;
        }
        status.flee += bonus;
    } 

    if(sc_get(player, SC.INCCRI) || sc_get(player, SC.ARUNAFELTZ_DESERT_SANDWICH)) { // crit food
        bonus = 0;
        const criFoods = [SC.INCCRI, SC.ARUNAFELTZ_DESERT_SANDWICH];
        for(const sc of criFoods) {
            const effect = sc_get(player, sc);
            if(effect && effect.val1 > bonus) bonus = effect.val1;
        }
        status.cri += bonus * 10;
    }

    if(sc_get(player, SC.ARMOR_ELEMENT_WATER)) { // coldproof potion
        player.indexed_bonus.subele[ELE.WATER] += sc_get(player, SC.ARMOR_ELEMENT_WATER).val1;
        player.indexed_bonus.subele[ELE.WIND] += sc_get(player, SC.ARMOR_ELEMENT_WATER).val4;
    }
    if(sc_get(player, SC.ARMOR_ELEMENT_EARTH)) { // earthproof potion
        player.indexed_bonus.subele[ELE.EARTH] += sc_get(player, SC.ARMOR_ELEMENT_EARTH).val2;
        player.indexed_bonus.subele[ELE.FIRE] += sc_get(player, SC.ARMOR_ELEMENT_EARTH).val3;
    }
    if(sc_get(player, SC.ARMOR_ELEMENT_FIRE)) { // fireproof potion
        player.indexed_bonus.subele[ELE.FIRE] += sc_get(player, SC.ARMOR_ELEMENT_FIRE).val3;
        player.indexed_bonus.subele[ELE.WATER] += sc_get(player, SC.ARMOR_ELEMENT_FIRE).val1;
    }
    if(sc_get(player, SC.ARMOR_ELEMENT_WIND)) { // thunderproof potion
        player.indexed_bonus.subele[ELE.WIND] += sc_get(player, SC.ARMOR_ELEMENT_WIND).val4;
        player.indexed_bonus.subele[ELE.EARTH] += sc_get(player, SC.ARMOR_ELEMENT_WIND).val2;
    }

    if(sc_get(player, SC.MANU_ATK)) {
        player.indexed_bonus.addrace2[RC2.MANUK] += sc_get(player, SC.MANU_ATK).val1;
    }

    if(sc_get(player, SC.MANU_DEF)) {
        player.indexed_bonus.subrace2[RC2.MANUK] += sc_get(player, SC.MANU_DEF).val1;
    }

    if(sc_get(player, SC.MANU_MATK)) {
        player.indexed_bonus.magic_addrace2[RC2.MANUK] += sc_get(player, SC.MANU_MATK).val1;
    }

    if(sc_get(player, SC.SPL_ATK)) {
        player.indexed_bonus.addrace2[RC2.SPLENDIDE] += sc_get(player, SC.SPL_ATK).val1;
    }

    if(sc_get(player, SC.SPL_DEF)) {
        player.indexed_bonus.subrace2[RC2.SPLENDIDE] += sc_get(player, SC.SPL_DEF).val1;
    }

    if(sc_get(player, SC.SPL_MATK)) {
        player.indexed_bonus.magic_addrace2[RC2.SPLENDIDE] += sc_get(player, SC.SPL_MATK).val1;
    }
}