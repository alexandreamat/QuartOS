# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import logging
from google.cloud import recaptchaenterprise_v1
from google.cloud.recaptchaenterprise_v1 import Assessment

from app.settings import settings

logger = logging.getLogger(__name__)


class ReCaptchaException(Exception): ...


class InvalidToken(ReCaptchaException):
    def __init__(self, reason: str) -> None:
        super().__init__(
            "The CreateAssessment call failed because the token was invalid for the following reasons: ",
            reason,
        )


class UnexpectedAction(ReCaptchaException):
    def __init__(self, expected: str, actual: str) -> None:
        super().__init__(
            f"The action attribute in your reCAPTCHA tag {actual} does not match the action you are expecting to score {expected}"
        )


def create_recaptcha_assessment(token: str, recaptcha_action: str) -> Assessment:
    client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient(
        client_options={"api_key": settings.GOOGLE_API_KEY}
    )

    # Set the properties of the event to be tracked.
    event = recaptchaenterprise_v1.Event()
    event.site_key = settings.GOOGLE_SITE_KEY
    event.token = token

    assessment = recaptchaenterprise_v1.Assessment()
    assessment.event = event

    project_name = f"projects/{settings.GOOGLE_PROJECT_ID}"

    # Build the assessment request.
    request = recaptchaenterprise_v1.CreateAssessmentRequest()
    request.assessment = assessment
    request.parent = project_name

    response = client.create_assessment(request)

    # Check if the token is valid.
    if not response.token_properties.valid:
        raise InvalidToken(str(response.token_properties.invalid_reason))

    # Check if the expected action was executed.
    if response.token_properties.action != recaptcha_action:
        raise UnexpectedAction(recaptcha_action, response.token_properties.action)

    # Get the risk score and the reason(s).
    # For more information on interpreting the assessment, see:
    # https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    for reason in response.risk_analysis.reasons:
        logger.info(reason)
    logger.info(
        f"The reCAPTCHA score for this token is: {response.risk_analysis.score}"
    )
    # Get the assessment name (id). Use this to annotate the assessment.
    assessment_name = client.parse_assessment_path(response.name).get("assessment")
    logger.info(f"Assessment name: {assessment_name}")
    return response
