from app.common.crud import CRUDBase

from .models import (
    ReplacementPattern,
    ReplacementPatternApiIn,
    ReplacementPatternApiOut,
)


class CRUDReplacementPattern(
    CRUDBase[ReplacementPattern, ReplacementPatternApiOut, ReplacementPatternApiIn]
):
    db_model = ReplacementPattern
    out_model = ReplacementPatternApiOut
