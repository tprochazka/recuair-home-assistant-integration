"""Stable, non-destructive identifiers for Recuair devices."""
from __future__ import annotations

import re

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN

_MAC_PATTERN = re.compile(r"^[0-9a-f]{2}(?::[0-9a-f]{2}){5}$")


def entry_identifier(entry: ConfigEntry) -> str:
    """Return an identifier that also works for entries created by old releases."""
    return entry.unique_id or entry.entry_id


def device_identifiers(entry: ConfigEntry) -> set[tuple[str, str | None]]:
    """Keep the device association created by the legacy integration."""
    return {(DOMAIN, entry.unique_id)}


def sensor_unique_id(entry: ConfigEntry, sensor_key: str) -> str:
    """Keep sensor entity IDs stable for entries created before config flow IDs."""
    unique_id = entry.unique_id
    if unique_id is None or (
        not _MAC_PATTERN.fullmatch(unique_id.casefold())
        and not unique_id.casefold().startswith("host:")
    ):
        return f"{ {(DOMAIN, unique_id)} }_{sensor_key}"
    return f"{entry_identifier(entry)}_{sensor_key}"


def mac_connection(entry: ConfigEntry) -> set[tuple[str, str]]:
    """Return a network connection only when the config entry has a verified MAC."""
    unique_id = entry.unique_id or ""
    if _MAC_PATTERN.fullmatch(unique_id.casefold()):
        return {(dr.CONNECTION_NETWORK_MAC, unique_id.casefold())}
    return set()
