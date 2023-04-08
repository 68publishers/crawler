<?php

namespace App\Domain\Exception;

use DomainException;
use App\Domain\Process\ValueObject\Url;

final class InvalidUrlException extends DomainException
{
    public function __construct(
        string $message,
        public readonly string $value,
    ) {
        parent::__construct($message);
    }

    public static function create(string $value): self
    {
        return new self(sprintf(
            'Value %s is not valid url for a value object of the type %s.',
            $value,
            Url::class,
        ), $value);
    }
}
