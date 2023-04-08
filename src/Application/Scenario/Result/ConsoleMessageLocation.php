<?php

namespace App\Application\Scenario\Result;

use JsonSerializable;

final class ConsoleMessageLocation implements JsonSerializable
{
    public function __construct(
        public readonly string $url,
        public readonly int $lineNumber,
        public readonly int $columnNumber,
    ) {}

    public function equals(self $consoleMessageLocation): bool
    {
        return $consoleMessageLocation->url === $this->url
            && $consoleMessageLocation->lineNumber === $this->lineNumber
            && $consoleMessageLocation->columnNumber === $this->columnNumber;
    }

    /**
     * @return array{url: string, lineNumber: int, columnNumber: int}
     */
    public function jsonSerialize(): array
    {
        return [
            'url' => $this->url,
            'lineNumber' => $this->lineNumber,
            'columnNumber' => $this->columnNumber,
        ];
    }
}
