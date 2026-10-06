"""Stable role metadata independent of user entity IDs and availability."""


class RecuairRoleMixin:
    """Keep the dashboard role in HA capabilities, including unavailable states."""

    @property
    def capability_attributes(self):
        # Preserve color modes, select options, number bounds and update features.
        return {**(super().capability_attributes or {}), "recuair_role": self._recuair_role}
