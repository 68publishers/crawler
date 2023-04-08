<?php

namespace App\Domain\Process\ValueObject;

use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\CompositeValueObjectTrait;

final class Action implements ValueObjectInterface
{
    use CompositeValueObjectTrait;

    public function __construct(
        public readonly ActionName $name,
        public readonly ActionParameters $parameters,
    ) {}

    protected static function fromNativeFactory(callable $factory): static
    {
        return new self(
            $factory(ActionName::class, 'name'),
            $factory(ActionParameters::class, 'parameters'),
        );
    }
}
