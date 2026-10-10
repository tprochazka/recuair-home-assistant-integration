"""Serve the optional Lovelace card from the integration package."""
import hashlib
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration


async def async_setup_frontend(hass: HomeAssistant) -> None:
    """Register bundled JS without changing dashboards or resource storage."""
    # Headless installations can still use every entity and service.
    if "frontend" not in hass.config.components:
        return
    integration = await async_get_integration(hass, "recuair")
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            "/recuair_static",
            str(Path(__file__).parent / "frontend"),
            False,
        ),
    ])
    asset = Path(__file__).parent / "frontend" / "recuair-dashboard.js"
    # Invalidate browser caches for local deployments as well as releases.
    content_hash = await hass.async_add_executor_job(
        lambda: hashlib.sha256(asset.read_bytes()).hexdigest()[:16]
    )
    frontend.add_extra_js_url(
        hass,
        f"/recuair_static/recuair-dashboard.js?v={integration.version}&h={content_hash}",
    )
