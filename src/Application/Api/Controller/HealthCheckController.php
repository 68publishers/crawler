<?php

declare(strict_types=1);

namespace App\Application\Api\Controller;

use Apitte\Core\Http\ApiRequest;
use Apitte\Core\Http\ApiResponse;
use Apitte\Core\Annotation\Controller\Path;
use Apitte\Core\Annotation\Controller\Method;
use SixtyEightPublishers\HealthCheck\HealthCheckerInterface;

#[Path("/health-check")]
final class HealthCheckController extends AbstractController
{
	public function __construct(
        private readonly HealthCheckerInterface $healthChecker,
    ) {}

    #[Path('/')]
    #[Method("GET")]
	public function index(ApiRequest $request, ApiResponse $response): ApiResponse
	{
        $result = $this->healthChecker->check();

        return $response
            ->withStatus($result->isOk() ? ApiResponse::S200_OK : ApiResponse::S503_SERVICE_UNAVAILABLE)
            ->writeJsonObject($result);
	}
}
