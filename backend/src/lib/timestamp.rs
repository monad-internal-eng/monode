use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::time::SystemTime;

#[derive(Debug, Clone)]
pub struct NanoTimestamp(u128);

impl Serialize for NanoTimestamp {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<'de> Deserialize<'de> for NanoTimestamp {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        s.parse::<u128>()
            .map(Self)
            .map_err(serde::de::Error::custom)
    }
}

pub fn get_unix_time_ns() -> NanoTimestamp {
    let duration_since_epoch = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap();
    NanoTimestamp(duration_since_epoch.as_nanos())
}
