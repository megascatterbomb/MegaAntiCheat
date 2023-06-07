mod utils;

use std::convert::TryFrom;
use wasm_bindgen::prelude::*;
use tsify::Tsify;
use bitbuffer::BitRead;
use serde::{Serialize, Serializer, Deserialize};
use serde::ser::SerializeStruct;
use tf_demo_parser::demo::data::DemoTick;
pub use tf_demo_parser::{Demo, DemoParser, Parse, ParseError, ParserState, Stream};
use tf_demo_parser::demo::header::Header;
use tf_demo_parser::demo::parser::gamestateanalyser::{GameState, GameStateAnalyser, Hurt};
use tf_demo_parser::demo::vector::Vector;

#[derive(Tsify, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
struct ViewAngles {
    pitch: f32,
    yaw: f32,
}

impl ViewAngles {
    fn new(pitch: f32, yaw: f32) -> Self {
        Self { pitch, yaw }
    }
}

impl Serialize for ViewAngles{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        let mut s = serializer.serialize_struct("ViewAngles", 2)?;
        s.serialize_field("pitch", &self.pitch)?;
        s.serialize_field("yaw", &self.yaw)?;
        s.end()
    }
}

#[derive(Tsify,Serialize, Deserialize,BitRead)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct WrappedHeader {
    #[size = 8]
    pub demo_type: String,
    pub version: u32,
    pub protocol: u32,
    #[size = 260]
    pub server: String,
    #[size = 260]
    pub nick: String,
    #[size = 260]
    pub map: String,
    #[size = 260]
    pub game: String,
    pub duration: f32,
    pub ticks: u32,
    pub frames: u32,
    pub signon: u32,
}

impl From<Header> for WrappedHeader{
    fn from(value: Header) -> Self {
        WrappedHeader {
            demo_type: value.demo_type,
            version: value.version,
            protocol: value.protocol,
            server: value.server,
            nick: value.nick,
            map: value.map,
            game: value.game,
            duration: value.duration,
            ticks: value.ticks,
            frames: value.frames,
            signon: value.signon,
        }
    }
}

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct WrappedDemoTick(u32);

impl From<DemoTick> for WrappedDemoTick {
    fn from(value: DemoTick) -> Self {
        WrappedDemoTick(u32::from(value))
    }
}

#[derive(Tsify, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct McdOutputFile {
    info: WrappedHeader,
    ticks: Vec<McdTick>
}
impl Serialize for McdOutputFile {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        let mut s = serializer.serialize_struct("McdOutputFile", 2)?;
        s.serialize_field("info", &self.info)?;
        s.serialize_field("ticks", &self.ticks)?;
        s.end()
    }
}

impl McdOutputFile {
    fn new() -> Self {
        Self {
            info: WrappedHeader::try_from(Header {
                demo_type: "".to_string(),
                version: 0,
                protocol: 0,
                server: "".to_string(),
                nick: "".to_string(),
                map: "".to_string(),
                game: "".to_string(),
                duration: 0.0,
                ticks: 0,
                frames: 0,
                signon: 0,
            }).unwrap(),
            ticks: Vec::new(),
        }
    }
}

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
struct WrappedVector {
    x: f32,
    y: f32,
    z: f32,
}

impl From<Vector> for WrappedVector {
    fn from(value: Vector) -> Self {
        WrappedVector {
            x: value.x,
            y: value.y,
            z: value.z,
        }
    }
}

#[derive(Tsify, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
struct PlayerTickInfo {
    player: String,
    view_angles: ViewAngles,
    position: WrappedVector,
}

impl Serialize for PlayerTickInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        let mut s = serializer.serialize_struct("PlayerTickInfo", 3)?;
        s.serialize_field("player", &self.player)?;
        s.serialize_field("view_angles", &self.view_angles)?;
        s.serialize_field("position", &self.position)?;
        s.end()
    }
}

#[derive(Tsify, Deserialize, Serialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
struct WrappedHurt {
    tick: WrappedDemoTick,
    user_id: u16,
    health: u16,
    attacker_id: u16,
    damage_amount: u16,
    custom: u16,
    show_disguised_crit: bool,
    crit: bool,
    mini_crit: bool,
    all_see_crit: bool,
    weapon_id: u16,
    bonus_effect: u8,
}

impl From<Hurt> for WrappedHurt{
    fn from(value: Hurt) -> Self {
        WrappedHurt {
            tick: WrappedDemoTick::try_from(value.tick).unwrap(),
            user_id: value.user_id,
            health: value.health,
            attacker_id: value.attacker_id,
            damage_amount: value.damage_amount,
            custom: value.custom,
            show_disguised_crit: value.show_disguised_crit,
            crit: value.crit,
            mini_crit: value.mini_crit,
            all_see_crit: value.all_see_crit,
            weapon_id: value.weapon_id,
            bonus_effect: value.bonus_effect,
        }
    }
}

#[derive(Tsify, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
struct McdTick {
    tick: WrappedDemoTick,
    players: Vec<PlayerTickInfo>,
    hurts: Vec<WrappedHurt>
}

impl Serialize for McdTick {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        let mut s = serializer.serialize_struct("PlayerTickInfo", 3)?;
        s.serialize_field("players", &self.players)?;
        s.serialize_field("tick", &self.tick)?;
        s.serialize_field("hurts", &self.hurts)?;
        s.end()
    }
}

#[wasm_bindgen]
pub fn parse_demo(file: Vec<u8>) -> McdOutputFile {
    #[cfg(feature = "trace")]
    tracing_subscriber::fmt::init();
    utils::set_panic_hook();
    let mut output = McdOutputFile::new();

    //let file = fs::read(&path).unwrap();
    let demo = Demo::owned(file);
    let (header, mut ticker) = DemoParser::new_all_with_analyser(demo.get_stream(), GameStateAnalyser::new()).ticker().unwrap();

    output.info = WrappedHeader::try_from(header).unwrap();

    loop {
        match ticker.tick() {
            Ok(true) => {
                output.ticks.push(handle_tick(ticker.state()));
                continue;
            }
            Ok(false) => {
                break;
            }
            Err(e) => {
                println!("Error: {e:?}");
                break;
            }
        }
    }

    output
}

fn handle_tick(tick: &GameState) -> McdTick {
    let mut output_tick = McdTick {
        tick: WrappedDemoTick::try_from(tick.tick).unwrap(),
        players: Vec::new(),
        hurts: Vec::new(),
    };
    tick.players.iter().for_each(|player| {
        let player_info = player.info.as_ref().unwrap();
        output_tick.players.push(PlayerTickInfo {
            player: player_info.steam_id.clone(),
            view_angles: ViewAngles::new(player.pitch_angle, player.view_angle),
            position: WrappedVector::try_from(player.position).unwrap(),
        });
    });

    for x in tick.hurts.iter() {
        output_tick.hurts.push(WrappedHurt::try_from(x.clone()).unwrap());
    }

    output_tick
}