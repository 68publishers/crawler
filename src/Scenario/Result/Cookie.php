<?php

namespace App\Scenario\Result;

use JsonSerializable;

final class Cookie implements JsonSerializable
{
    public function __construct(
        public readonly string $name,
        public readonly string $domain,
        public readonly string $foundOnUrl,
        public readonly bool $httpOnly,
        public readonly bool $secure,
        public readonly bool $session,
        public readonly ?string $sameSite,
    ) {}

    public function equals(self $cookie): bool
    {
        return $cookie->name === $this->name && $cookie->domain === $this->domain;
    }

    /**
     * @return array{
     *     name: string,
     *     domain: string,
     *     foundOnUrl: string,
     *     secure: bool,
     *     session: bool,
     *     sameSite: ?string
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'domain' => $this->domain,
            'foundOnUrl' => $this->foundOnUrl,
            'httpOnly' => $this->httpOnly,
            'secure' => $this->secure,
            'session' => $this->session,
            'sameSite' => $this->sameSite,
        ];
    }
}
