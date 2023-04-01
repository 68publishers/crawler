<?php

namespace App\Scenario\Result;

use Throwable;
use JsonSerializable;

final class VisitError implements JsonSerializable
{
    public function __construct(
        public readonly string $url,
        public readonly Throwable $error,
    ) {}

    public function equals(self $visitError): bool
    {
        return $visitError->url === $this->url && $visitError->error->getMessage() === $this->error->getMessage();
    }

    /**
     * @return array{url: string, error: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'url' => $this->url,
            'error' => $this->error->getMessage(),
        ];
    }
}
