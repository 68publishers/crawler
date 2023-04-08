<?php

namespace App\Domain\Process\ValueObject;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ArrayValueTrait;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;

final class ActionParameters implements ValueObjectInterface
{
    use ArrayValueTrait;
}
