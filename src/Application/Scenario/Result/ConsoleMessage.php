<?php

namespace App\Application\Scenario\Result;

use JsonSerializable;

final class ConsoleMessage implements JsonSerializable
{
    public function __construct(
        public readonly string $type,
        public readonly string $message,
        public readonly ?ConsoleMessageLocation $location,
    ) {}

    public function equals(self $consoleMessage): bool
    {
        return $consoleMessage->type === $this->type
            && $consoleMessage->message === $this->message
            && (
                (null === $consoleMessage->location && null === $this->location)
                || (null !== $consoleMessage->location && null !== $this->location && $consoleMessage->location->equals($this->location))
            );
    }

    /**
     * @return array{type: string, message: string, location: ?ConsoleMessageLocation}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'message' => $this->message,
            'location' => $this->location,
        ];
    }
}
