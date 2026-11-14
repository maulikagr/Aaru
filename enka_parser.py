"""
Enka Network API Parser
Fetches and processes player profile data and character builds
in the authentic style of Enka.network.
"""
import os
import json
import ssl
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

def load_data_file(filename: str) -> Dict[str, Any]:
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

CHARACTERS_DATA = load_data_file("characters.json")
LOC_DATA = load_data_file("loc.json").get("en", {})

# Common Artifact Set ID Mapping
ARTIFACT_SETS = {
    "14001": "Blizzard Strayer",
    "14002": "Thundersoother",
    "14003": "Lavawalker",
    "14004": "Maiden Beloved",
    "14005": "Gladiator's Finale",
    "14006": "Viridescent Venerer",
    "14007": "Wanderer's Troupe",
    "14008": "Thundering Fury",
    "14009": "Crimson Witch of Flames",
    "14010": "Noblesse Oblige",
    "14011": "Bloodstained Chivalry",
    "15001": "Archaic Petra",
    "15002": "Retracing Bolide",
    "15003": "Heart of Depth",
    "15005": "Tenacity of the Millelith",
    "15006": "Pale Flame",
    "15007": "Shimenawa's Reminiscence",
    "15008": "Bloodstained Chivalry",
    "15017": "Husk of Opulent Dreams",
    "15018": "Ocean-Hued Clam",
    "15019": "Vermillion Hereafter",
    "15020": "Echoes of an Offering",
    "15021": "Deepwood Memories",
    "15022": "Gilded Dreams",
    "15023": "Desert Pavilion Chronicle",
    "15024": "Flower of Paradise Lost",
    "15025": "Nymph's Dream",
    "15026": "Vourukasha's Glow",
    "15027": "Marechaussee Hunter",
    "15028": "Golden Troupe",
    "15029": "Song of Days Past",
    "15030": "Nighttime Whispers in the Echoing Woods",
    "15031": "Fragment of Harmonic Whimsy",
    "15032": "Unfinished Reverie",
    "15033": "Scroll of the Hero of Cinder City",
    "15034": "Obsidian Codex",
    "15037": "Scroll of the Hero of Cinder City",
    "15038": "Nighttime Whispers in the Echoing Woods",
    "15041": "Night of the Sky's Unveiling",
    "15042": "Silken Moon's Serenade",
    "15043": "Aubade of Morningstar and Moon",
    "15044": "A Day Carved From Rising Winds",
    "15046": "Disenchantment in Deep Shadow",
    "15048": "Heart of the Furnace"
}

ARTIFACT_HASHES = {
    "933076115": "Blizzard Strayer",
    "1541919827": "Bloodstained Chivalry",
    "3721836931": "A Day Carved From Rising Winds",
    "3690673363": "Night of the Sky's Unveiling",
    "894629371": "Aubade of Morningstar and Moon",
    "862591315": "Ocean-Hued Clam",
    "2276480251": "Echoes of an Offering",
    "279470371": "Obsidian Codex",
    "1212345779": "Archaic Petra",
    "1774578891": "Nighttime Whispers in the Echoing Woods",
    "1337665995": "Husk of Opulent Dreams",
    "2949387691": "Scroll of the Hero of Cinder City",
    "1086878883": "Disenchantment in Deep Shadow",
    "3410220315": "Golden Troupe",
    "1035953267": "Heart of the Furnace",
    "625305019": "Silken Moon's Serenade"
}

# Stat Prop Names Mapping
PROP_NAMES = {
    "FIGHT_PROP_HP": "HP",
    "FIGHT_PROP_HP_PERCENT": "HP",
    "FIGHT_PROP_ATTACK": "ATK",
    "FIGHT_PROP_ATTACK_PERCENT": "ATK",
    "FIGHT_PROP_DEFENSE": "DEF",
    "FIGHT_PROP_DEFENSE_PERCENT": "DEF",
    "FIGHT_PROP_CRITICAL": "CRIT Rate",
    "FIGHT_PROP_CRITICAL_HURT": "CRIT DMG",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "Energy Recharge",
    "FIGHT_PROP_ELEMENT_MASTERY": "Elemental Mastery",
    "FIGHT_PROP_FIRE_ADD_HURT": "Pyro DMG Bonus",
    "FIGHT_PROP_WATER_ADD_HURT": "Hydro DMG Bonus",
    "FIGHT_PROP_ELEC_ADD_HURT": "Electro DMG Bonus",
    "FIGHT_PROP_WIND_ADD_HURT": "Anemo DMG Bonus",
    "FIGHT_PROP_ICE_ADD_HURT": "Cryo DMG Bonus",
    "FIGHT_PROP_ROCK_ADD_HURT": "Geo DMG Bonus",
    "FIGHT_PROP_GRASS_ADD_HURT": "Dendro DMG Bonus",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "Physical DMG Bonus",
    "FIGHT_PROP_HEAL_ADD": "Healing Bonus",
    "FIGHT_PROP_BASE_ATTACK": "Base ATK"
}

PERCENT_PROPS = {
    "FIGHT_PROP_HP_PERCENT", "FIGHT_PROP_ATTACK_PERCENT", "FIGHT_PROP_DEFENSE_PERCENT",
    "FIGHT_PROP_CRITICAL", "FIGHT_PROP_CRITICAL_HURT", "FIGHT_PROP_CHARGE_EFFICIENCY",
    "FIGHT_PROP_FIRE_ADD_HURT", "FIGHT_PROP_WATER_ADD_HURT", "FIGHT_PROP_ELEC_ADD_HURT",
    "FIGHT_PROP_WIND_ADD_HURT", "FIGHT_PROP_ICE_ADD_HURT", "FIGHT_PROP_ROCK_ADD_HURT",
    "FIGHT_PROP_GRASS_ADD_HURT", "FIGHT_PROP_PHYSICAL_ADD_HURT", "FIGHT_PROP_HEAL_ADD"
}

ELEMENT_NAMES = {
    "Fire": "Pyro",
    "Water": "Hydro",
    "Ice": "Cryo",
    "Electric": "Electro",
    "Wind": "Anemo",
    "Rock": "Geo",
    "Grass": "Dendro"
}

# Official Enka Data Overrides for New & Harbinger Characters
CUSTOM_CHARACTERS = {
    "10000002": {
        "name": "Kamisato Ayaka",
        "element": "Cryo",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Ayaka.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Ayaka.png"
    },
    "10000128": {
        "name": "Varka",
        "element": "Anemo",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Varka.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Varka.png"
    },
    "10000120": {
        "name": "Flins",
        "element": "Electro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Flins.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Flins.png"
    },
    "10000125": {
        "name": "Columbina",
        "element": "Hydro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Columbina.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Columbina.png"
    },
    "10000091": {
        "name": "Navia",
        "element": "Geo",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Navia.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Navia.png"
    },
    "10000102": {
        "name": "Mualani",
        "element": "Hydro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Mualani.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Mualani.png"
    },
    "10000106": {
        "name": "Mavuika",
        "element": "Pyro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Mavuika.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Mavuika.png"
    },
    "10000133": {
        "name": "Sandrone",
        "element": "Cryo",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_MarionetteNew.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_MarionetteNew.png"
    },
    "10000089": {
        "name": "Furina",
        "element": "Hydro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Furina.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Furina.png"
    },
    "10000150": {
        "name": "Odette",
        "element": "Cryo",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Odette.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Odette.png"
    },
    "10000116": {
        "name": "Ineffa",
        "element": "Electro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Ineffa.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Ineffa.png"
    },
    "10000058": {
        "name": "Yae Miko",
        "element": "Electro",
        "iconUrl": "https://enka.network/ui/UI_AvatarIcon_Side_Yae.png",
        "splashUrl": "https://enka.network/ui/UI_Gacha_AvatarImg_Yae.png"
    }
}

CUSTOM_WEAPONS = {
    "UI_EquipIcon_Sword_Bakufu": "Amenoma Kageuchi",
    "UI_EquipIcon_Claymore_EnsisAquilonis": "Gest of the Mighty Wolf",
    "UI_EquipIcon_Pole_TummaLyhty": "Bloodsoaked Ruins",
    "UI_EquipIcon_Catalyst_Brisingamen": "Nocturne's Curtain Call",
    "UI_EquipIcon_Claymore_Kunwu": "The Unforged",
    "UI_EquipIcon_Catalyst_MechaPufferfish": "Surf's Up",
    "UI_EquipIcon_Claymore_EmeraldSword": "Fang of the Mountain King",
    "UI_EquipIcon_Claymore_RadianceSword": "A Thousand Blazing Suns",
    "UI_EquipIcon_Sword_Machination": "Fleuve Cendre Ferryman",
    "UI_EquipIcon_Sword_WeaponQuestSnezhnaya": "Exaiphanes Blade",
    "UI_EquipIcon_Pole_Aoandon": "Tamayuratei no Ohanashi",
    "UI_EquipIcon_Catalyst_Fourwinds": "Lost Prayer to the Sacred Winds"
}

def create_ssl_context():
    """Bypasses macOS local issuer certificate errors safely for Enka queries."""
    try:
        return ssl._create_unverified_context()
    except Exception:
        return ssl.create_default_context()

def format_stat_value(prop_id: str, value: float) -> str:
    """Formats numeric stat value with commas or percent signs."""
    if prop_id in PERCENT_PROPS:
        return f"{value:.1f}%"
    return f"{round(value):,}"

def parse_artifact(item: Dict[str, Any]) -> Dict[str, Any]:
    """Parses a single artifact slot from equipList."""
    flat = item.get("flat", {})
    icon = flat.get("icon", "")
    equip_type = flat.get("equipType", "")
    level = item.get("reliquary", {}).get("level", 1) - 1
    rank = flat.get("rankLevel", 5)

    slot_names = {
        "EQUIP_BRACER": "Flower of Life",
        "EQUIP_NECKLACE": "Plume of Death",
        "EQUIP_SHOES": "Sands of Eon",
        "EQUIP_RING": "Goblet of Eonothem",
        "EQUIP_DRESS": "Circlet of Logos"
    }
    slot_label = slot_names.get(equip_type, "Artifact")

    # Main stat
    main_obj = flat.get("reliquaryMainstat", {})
    main_prop_id = main_obj.get("mainPropId", "")
    main_val = main_obj.get("statValue", 0.0)
    main_name = PROP_NAMES.get(main_prop_id, main_prop_id.replace("FIGHT_PROP_", ""))
    main_str = format_stat_value(main_prop_id, main_val)

    # Substats
    substats = []
    for sub in flat.get("reliquarySubstats", []):
        sub_id = sub.get("appendPropId", "")
        sub_val = sub.get("statValue", 0.0)
        sub_name = PROP_NAMES.get(sub_id, sub_id.replace("FIGHT_PROP_", ""))
        substats.append({
            "name": sub_name,
            "value": format_stat_value(sub_id, sub_val),
            "propId": sub_id
        })

    # Set name determination
    set_hash = str(flat.get("setNameTextMapHash", ""))
    set_name = ARTIFACT_HASHES.get(set_hash) or LOC_DATA.get(set_hash)
    if not set_name:
        # Detect by icon prefix
        for prefix, s_name in ARTIFACT_SETS.items():
            if f"_{prefix}_" in icon:
                set_name = s_name
                break
    if not set_name:
        set_name = "Artifact Set"

    return {
        "slot": slot_label,
        "equipType": equip_type,
        "iconUrl": f"https://enka.network/ui/{icon}.png" if icon else "",
        "level": level,
        "rank": rank,
        "setName": set_name,
        "mainStat": {
            "name": main_name,
            "value": f"+{main_str}",
            "propId": main_prop_id
        },
        "substats": substats
    }

def parse_weapon(item: Dict[str, Any]) -> Dict[str, Any]:
    """Parses weapon from equipList."""
    flat = item.get("flat", {})
    icon = flat.get("icon", "")
    rank = flat.get("rankLevel", 4)
    w_info = item.get("weapon", {})
    level = w_info.get("level", 1)
    promote_level = w_info.get("promoteLevel", 0)
    
    # Refinement
    affix_map = w_info.get("affixMap", {})
    refinement = list(affix_map.values())[0] + 1 if affix_map else 1

    name_hash = str(flat.get("nameTextMapHash", ""))
    weapon_name = CUSTOM_WEAPONS.get(icon) or LOC_DATA.get(name_hash)
    if not weapon_name:
        weapon_name = icon.replace("UI_EquipIcon_", "").replace("_", " ")

    base_atk = 0
    substat = None
    for ws in flat.get("weaponStats", []):
        pid = ws.get("appendPropId", "")
        val = ws.get("statValue", 0.0)
        if pid == "FIGHT_PROP_BASE_ATTACK":
            base_atk = int(val)
        else:
            pname = PROP_NAMES.get(pid, pid.replace("FIGHT_PROP_", ""))
            substat = {
                "name": pname,
                "value": format_stat_value(pid, val)
            }

    return {
        "name": weapon_name,
        "iconUrl": f"https://enka.network/ui/{icon}.png" if icon else "",
        "rank": rank,
        "level": level,
        "promoteLevel": promote_level,
        "refinement": refinement,
        "baseAtk": base_atk,
        "substat": substat
    }

def parse_avatar(avatar: Dict[str, Any]) -> Dict[str, Any]:
    """Parses a full character profile and combat build."""
    avatar_id = str(avatar.get("avatarId", ""))
    c_meta = CHARACTERS_DATA.get(avatar_id, {})

    name_hash = str(c_meta.get("NameTextMapHash", ""))
    char_name = LOC_DATA.get(name_hash)

    # Check custom overrides (Sandrone, Odette, Varka, Alice, Dainsleif, Columbina)
    custom_override = CUSTOM_CHARACTERS.get(avatar_id)
    if custom_override:
        char_name = custom_override["name"]
        element = custom_override["element"]
        icon_url = custom_override["iconUrl"]
        splash_url = custom_override["splashUrl"]
    else:
        if not char_name:
            char_name = f"Character_{avatar_id}"
        element_raw = c_meta.get("Element", "Ice")
        element = ELEMENT_NAMES.get(element_raw, element_raw)
        side_icon = c_meta.get("SideIconName", "")
        icon_url = f"https://enka.network/ui/{side_icon}.png" if side_icon else ""
        
        costume_id = avatar.get("costumeId")
        splash_name = f"UI_Gacha_AvatarImg_{char_name.replace(' ', '')}"
        if costume_id and str(costume_id) in c_meta.get("Costumes", {}):
            costume_art = c_meta["Costumes"][str(costume_id)].get("art")
            if costume_art:
                splash_name = costume_art
        splash_url = f"https://enka.network/ui/{splash_name}.png"

    # Constellation
    constellation = len(avatar.get("talentIdList", []))

    # Level & Friendship
    prop_map = avatar.get("propMap", {})
    level = int(prop_map.get("4001", {}).get("val", 90))
    friendship = int(avatar.get("fetterInfo", {}).get("expLevel", 10))

    # Fight Properties (Combat Stats Sheet)
    f_props = avatar.get("fightPropMap", {})
    base_hp = float(f_props.get("1", 0.0))
    total_hp = float(f_props.get("2000", f_props.get("1000", base_hp)))
    bonus_hp = max(0.0, total_hp - base_hp)

    base_atk = float(f_props.get("4", 0.0))
    total_atk = float(f_props.get("2001", base_atk))
    bonus_atk = max(0.0, total_atk - base_atk)

    base_def = float(f_props.get("7", 0.0))
    total_def = float(f_props.get("2002", base_def))
    bonus_def = max(0.0, total_def - base_def)

    em = float(f_props.get("28", 0.0))
    crit_rate = float(f_props.get("20", 0.05)) * 100.0
    crit_dmg = float(f_props.get("22", 0.50)) * 100.0
    er = float(f_props.get("23", 1.0)) * 100.0

    # Elemental DMG Bonus
    elem_prop_map = {
        "Pyro": ("40", "Pyro DMG Bonus"),
        "Electro": ("41", "Electro DMG Bonus"),
        "Hydro": ("42", "Hydro DMG Bonus"),
        "Dendro": ("43", "Dendro DMG Bonus"),
        "Anemo": ("44", "Anemo DMG Bonus"),
        "Geo": ("45", "Geo DMG Bonus"),
        "Cryo": ("46", "Cryo DMG Bonus")
    }
    elem_info = elem_prop_map.get(element, ("46", "Cryo DMG Bonus"))
    elem_bonus = float(f_props.get(elem_info[0], 0.0)) * 100.0
    phys_bonus = float(f_props.get("30", 0.0)) * 100.0

    # If physical bonus is higher than elemental, display physical (e.g. Eula)
    active_dmg_bonus = {
        "name": "Physical DMG Bonus" if phys_bonus > elem_bonus else elem_info[1],
        "value": f"{phys_bonus:.1f}%" if phys_bonus > elem_bonus else f"{elem_bonus:.1f}%"
    }

    # Talents
    skill_level_map = avatar.get("skillLevelMap", {})
    proud_skill_extra = avatar.get("proudSkillExtraLevelMap", {})
    skill_order = c_meta.get("SkillOrder", [])
    
    talents = []
    talent_labels = ["Normal Attack", "Elemental Skill", "Elemental Burst"]
    for i, s_id in enumerate(skill_order[:3]):
        raw_lvl = skill_level_map.get(str(s_id), 1)
        extra_lvl = proud_skill_extra.get(str(s_id), 0)
        total_lvl = raw_lvl + extra_lvl
        talents.append({
            "name": talent_labels[i] if i < len(talent_labels) else f"Talent {i+1}",
            "level": total_lvl,
            "isBoosted": extra_lvl > 0
        })

    # Equipment (Weapon & Artifacts)
    weapon = None
    artifacts = []
    set_counts = {}

    for eq in avatar.get("equipList", []):
        itype = eq.get("flat", {}).get("itemType")
        if itype == "ITEM_WEAPON":
            weapon = parse_weapon(eq)
        elif itype == "ITEM_RELIQUARY":
            art = parse_artifact(eq)
            artifacts.append(art)
            s_name = art.get("setName")
            if s_name and s_name != "Artifact Set":
                set_counts[s_name] = set_counts.get(s_name, 0) + 1

    # Active Set Bonuses
    set_bonuses = []
    for s_name, count in set_counts.items():
        if count >= 4:
            set_bonuses.append(f"{s_name} (4)")
        elif count >= 2:
            set_bonuses.append(f"{s_name} (2)")

    return {
        "avatarId": avatar_id,
        "name": char_name,
        "element": element,
        "level": level,
        "constellation": constellation,
        "friendship": friendship,
        "iconUrl": icon_url,
        "splashUrl": splash_url,
        "talents": talents,
        "weapon": weapon,
        "artifacts": artifacts,
        "setBonuses": set_bonuses,
        "stats": {
            "hp": {
                "total": round(total_hp),
                "base": round(base_hp),
                "bonus": round(bonus_hp)
            },
            "atk": {
                "total": round(total_atk),
                "base": round(base_atk),
                "bonus": round(bonus_atk)
            },
            "def": {
                "total": round(total_def),
                "base": round(base_def),
                "bonus": round(bonus_def)
            },
            "em": round(em),
            "critRate": f"{crit_rate:.1f}%",
            "critDmg": f"{crit_dmg:.1f}%",
            "energyRecharge": f"{er:.1f}%",
            "dmgBonus": active_dmg_bonus
        }
    }

def fetch_and_parse_enka(uid: str) -> Dict[str, Any]:
    """
    Main entry point: Queries Enka Network API and returns a complete,
    authentic profile representation.
    """
    cleaned_uid = str(uid).strip()
    url = f"https://enka.network/api/uid/{cleaned_uid}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "GenshinEnkaViewer/1.0 (contact@genshincalc.local)",
            "Accept": "application/json"
        }
    )

    ctx = create_ssl_context()

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            if response.status == 200:
                raw_bytes = response.read()
                data = json.loads(raw_bytes.decode("utf-8"))

                p_info = data.get("playerInfo", {})
                nickname = p_info.get("nickname", "Traveler")
                level = p_info.get("level", 60)
                world_level = p_info.get("worldLevel", 8)
                signature = p_info.get("signature", "")
                achievements = p_info.get("finishAchievementNum", 0)
                
                # Spiral Abyss floor & chamber
                tower_floor = p_info.get("towerFloorIndex", 0)
                tower_chamber = p_info.get("towerLevelIndex", 0)
                tower_star = p_info.get("towerStarIndex", 0)
                abyss_str = f"Floor {tower_floor} - Chamber {tower_chamber}" if tower_floor else "Not Cleared"

                # Stygian Nymph
                stygian_seconds = p_info.get("stygianSeconds", 0)
                stygian_index = p_info.get("stygianIndex", 0)

                # Theater (Imaginarium Theater)
                theater_act = p_info.get("theaterActIndex", 0)
                theater_mode = p_info.get("theaterModeIndex", 0)
                theater_star = p_info.get("theaterStarIndex", 0)

                # Profile picture
                profile_pic = p_info.get("profilePicture", {})
                avatar_pic_id = profile_pic.get("avatarId")
                pic_id = profile_pic.get("id")

                if pic_id == 11600 or avatar_pic_id == 10000133:
                    profile_icon_url = "https://enka.network/ui/UI_AvatarIcon_MarionetteNew.png"
                elif avatar_pic_id and str(avatar_pic_id) in CUSTOM_CHARACTERS:
                    profile_icon_url = CUSTOM_CHARACTERS[str(avatar_pic_id)]["iconUrl"]
                elif avatar_pic_id and str(avatar_pic_id) in CHARACTERS_DATA:
                    p_side_icon = CHARACTERS_DATA[str(avatar_pic_id)].get("SideIconName", "UI_AvatarIcon_Side_PlayerBoy")
                    profile_icon_url = f"https://enka.network/ui/{p_side_icon}.png"
                else:
                    profile_icon_url = "https://enka.network/ui/UI_AvatarIcon_MarionetteNew.png"

                # Check avatarInfoList
                avatar_list = data.get("avatarInfoList", [])
                if not avatar_list:
                    return {
                        "success": True,
                        "status": "hidden_showcase",
                        "player": {
                            "uid": cleaned_uid,
                            "nickname": nickname,
                            "level": level,
                            "worldLevel": world_level,
                            "signature": signature,
                            "achievements": achievements,
                            "abyss": abyss_str,
                            "towerFloor": tower_floor,
                            "towerStar": tower_star,
                            "stygianSeconds": stygian_seconds,
                            "stygianIndex": stygian_index,
                            "theaterAct": theater_act,
                            "theaterMode": theater_mode,
                            "theaterStar": theater_star,
                            "profileIconUrl": profile_icon_url,
                            "characterCount": 0
                        },
                        "characters": [],
                        "warning": (
                            f"Player \"{nickname}\" (AR {level}) found, but your in-game Character Showcase details are private! "
                            "In Genshin Impact: Open Paimon Menu ➔ Edit Profile ➔ Turn ON \"Show Character Details\"."
                        )
                    }

                parsed_avatars = []
                for a_raw in avatar_list:
                    try:
                        p_char = parse_avatar(a_raw)
                        parsed_avatars.append(p_char)
                    except Exception as e:
                        print(f"Error parsing avatar: {e}")

                return {
                    "success": True,
                    "status": "live",
                    "player": {
                        "uid": cleaned_uid,
                        "nickname": nickname,
                        "level": level,
                        "worldLevel": world_level,
                        "signature": signature,
                        "achievements": achievements,
                        "abyss": abyss_str,
                        "towerFloor": tower_floor,
                        "towerStar": tower_star,
                        "stygianSeconds": stygian_seconds,
                        "stygianIndex": stygian_index,
                        "theaterAct": theater_act,
                        "theaterMode": theater_mode,
                        "theaterStar": theater_star,
                        "profileIconUrl": profile_icon_url,
                        "characterCount": len(parsed_avatars)
                    },
                    "characters": parsed_avatars,
                    "message": f"Successfully loaded {len(parsed_avatars)} showcased characters for {nickname}!"
                }

    except urllib.error.HTTPError as e:
        if e.code == 400:
            return {"success": False, "error": f"Invalid UID '{cleaned_uid}'. Please check your UID digits."}
        elif e.code == 404:
            return {"success": False, "error": f"Player with UID {cleaned_uid} was not found on Genshin Impact servers."}
        elif e.code == 424:
            return {"success": False, "error": "Enka Network is undergoing game maintenance. Please try again shortly."}
        elif e.code == 429:
            return {"success": False, "error": "Enka Network rate limit reached. Please wait a moment before trying again."}
        else:
            return {"success": False, "error": f"Enka Network returned HTTP Error {e.code}: {e.reason}"}

    except Exception as e:
        return {"success": False, "error": f"Network error connecting to Enka Network: {type(e).__name__} ({str(e)})"}
