<?php

namespace App\Domain\Process\ValueObject;

use Nette\Utils\Validators;
use App\Domain\Exception\InvalidUrlException;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\StringValueTrait;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;

final class Url implements ValueObjectInterface
{
    use StringValueTrait {
        __construct as private __stringConstructor;
    }

    protected function __construct(string $value)
    {
        if (!Validators::isUrl($value)) {
            throw InvalidUrlException::create($value);
        }

        $this->__stringConstructor($value);
    }
}
