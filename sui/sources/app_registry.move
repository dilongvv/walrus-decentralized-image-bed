module walrus_image_bed_registry::app_registry;

use std::string::{Self, String};
use sui::event;

const E_NOT_DEVELOPER_WALLET: u64 = 1;

const EXPECTED_DEVELOPER: address =
    @0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69;

public struct AdminCap has key, store {
    id: object::UID,
}

public struct AppProfile has key {
    id: object::UID,
    app_name: String,
    developer: address,
    website_url: String,
    github_url: String,
    suins_name: String,
    app_version: String,
    created_at_ms: u64,
    updated_at_ms: u64,
}

public struct AppRegistered has copy, drop {
    app_name: String,
    developer: address,
    app_profile_id: object::ID,
    website_url: String,
    github_url: String,
    suins_name: String,
    app_version: String,
}

public struct AppProfileUpdated has copy, drop {
    app_profile_id: object::ID,
    developer: address,
    website_url: String,
    github_url: String,
    suins_name: String,
    app_version: String,
    updated_at_ms: u64,
}

fun init(ctx: &mut tx_context::TxContext) {
    let sender = tx_context::sender(ctx);
    assert!(sender == EXPECTED_DEVELOPER, E_NOT_DEVELOPER_WALLET);

    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    let profile = AppProfile {
        id: object::new(ctx),
        app_name: string::utf8(b"Walrus Decentralized Image Bed"),
        developer: EXPECTED_DEVELOPER,
        website_url: string::utf8(b"TBD"),
        github_url: string::utf8(b"TBD"),
        suins_name: string::utf8(b"TBD"),
        app_version: string::utf8(b"1.0.0"),
        // Module initializers do not receive Clock. Use the publish transaction
        // timestamp/checkpoint in Explorer as the immutable creation proof.
        created_at_ms: 0,
        updated_at_ms: 0,
    };

    let profile_id = object::id(&profile);

    event::emit(AppRegistered {
        app_name: string::utf8(b"Walrus Decentralized Image Bed"),
        developer: EXPECTED_DEVELOPER,
        app_profile_id: profile_id,
        website_url: string::utf8(b"TBD"),
        github_url: string::utf8(b"TBD"),
        suins_name: string::utf8(b"TBD"),
        app_version: string::utf8(b"1.0.0"),
    });

    transfer::transfer(admin_cap, sender);
    transfer::share_object(profile);
}

public fun update_profile(
    _admin_cap: &AdminCap,
    profile: &mut AppProfile,
    website_url: String,
    github_url: String,
    suins_name: String,
    app_version: String,
    updated_at_ms: u64,
) {
    profile.website_url = website_url;
    profile.github_url = github_url;
    profile.suins_name = suins_name;
    profile.app_version = app_version;
    profile.updated_at_ms = updated_at_ms;

    event::emit(AppProfileUpdated {
        app_profile_id: object::id(profile),
        developer: profile.developer,
        website_url: profile.website_url,
        github_url: profile.github_url,
        suins_name: profile.suins_name,
        app_version: profile.app_version,
        updated_at_ms,
    });
}

public fun app_name(profile: &AppProfile): String {
    profile.app_name
}

public fun developer(profile: &AppProfile): address {
    profile.developer
}

public fun website_url(profile: &AppProfile): String {
    profile.website_url
}

public fun github_url(profile: &AppProfile): String {
    profile.github_url
}

public fun suins_name(profile: &AppProfile): String {
    profile.suins_name
}

public fun app_version(profile: &AppProfile): String {
    profile.app_version
}
