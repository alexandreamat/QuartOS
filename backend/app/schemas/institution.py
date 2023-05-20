from typing import TYPE_CHECKING

from pydantic import BaseModel
from typing import Literal


from .base import OrmBase


class InstitutionBase(BaseModel):
    name: str
    country_code: Literal[
        "AW",
        "AF",
        "AO",
        "AI",
        "AX",
        "AL",
        "AD",
        "AE",
        "AR",
        "AM",
        "AS",
        "AQ",
        "TF",
        "AG",
        "AU",
        "AT",
        "AZ",
        "BI",
        "BE",
        "BJ",
        "BQ",
        "BF",
        "BD",
        "BG",
        "BH",
        "BS",
        "BA",
        "BL",
        "BY",
        "BZ",
        "BM",
        "BO",
        "BR",
        "BB",
        "BN",
        "BT",
        "BV",
        "BW",
        "CF",
        "CA",
        "CC",
        "CH",
        "CL",
        "CN",
        "CI",
        "CM",
        "CD",
        "CG",
        "CK",
        "CO",
        "KM",
        "CV",
        "CR",
        "CU",
        "CW",
        "CX",
        "KY",
        "CY",
        "CZ",
        "DE",
        "DJ",
        "DM",
        "DK",
        "DO",
        "DZ",
        "EC",
        "EG",
        "ER",
        "EH",
        "ES",
        "EE",
        "ET",
        "FI",
        "FJ",
        "FK",
        "FR",
        "FO",
        "FM",
        "GA",
        "GB",
        "GE",
        "GG",
        "GH",
        "GI",
        "GN",
        "GP",
        "GM",
        "GW",
        "GQ",
        "GR",
        "GD",
        "GL",
        "GT",
        "GF",
        "GU",
        "GY",
        "HK",
        "HM",
        "HN",
        "HR",
        "HT",
        "HU",
        "ID",
        "IM",
        "IN",
        "IO",
        "IE",
        "IR",
        "IQ",
        "IS",
        "IL",
        "IT",
        "JM",
        "JE",
        "JO",
        "JP",
        "KZ",
        "KE",
        "KG",
        "KH",
        "KI",
        "KN",
        "KR",
        "KW",
        "LA",
        "LB",
        "LR",
        "LY",
        "LC",
        "LI",
        "LK",
        "LS",
        "LT",
        "LU",
        "LV",
        "MO",
        "MF",
        "MA",
        "MC",
        "MD",
        "MG",
        "MV",
        "MX",
        "MH",
        "MK",
        "ML",
        "MT",
        "MM",
        "ME",
        "MN",
        "MP",
        "MZ",
        "MR",
        "MS",
        "MQ",
        "MU",
        "MW",
        "MY",
        "YT",
        "NA",
        "NC",
        "NE",
        "NF",
        "NG",
        "NI",
        "NU",
        "NL",
        "NO",
        "NP",
        "NR",
        "NZ",
        "OM",
        "PK",
        "PA",
        "PN",
        "PE",
        "PH",
        "PW",
        "PG",
        "PL",
        "PR",
        "KP",
        "PT",
        "PY",
        "PS",
        "PF",
        "QA",
        "RE",
        "RO",
        "RU",
        "RW",
        "SA",
        "SD",
        "SN",
        "SG",
        "GS",
        "SH",
        "SJ",
        "SB",
        "SL",
        "SV",
        "SM",
        "SO",
        "PM",
        "RS",
        "SS",
        "ST",
        "SR",
        "SK",
        "SI",
        "SE",
        "SZ",
        "SX",
        "SC",
        "SY",
        "TC",
        "TD",
        "TG",
        "TH",
        "TJ",
        "TK",
        "TM",
        "TL",
        "TO",
        "TT",
        "TN",
        "TR",
        "TV",
        "TW",
        "TZ",
        "UG",
        "UA",
        "UM",
        "UY",
        "US",
        "UZ",
        "VA",
        "VC",
        "VE",
        "VG",
        "VI",
        "VN",
        "VU",
        "WF",
        "WS",
        "YE",
        "ZA",
        "ZM",
        "ZW",
    ]


class InstitutionRead(InstitutionBase, OrmBase):
    ...


class InstitutionCreate(InstitutionBase):
    ...


class InstitutionUpdate(InstitutionBase):
    ...
