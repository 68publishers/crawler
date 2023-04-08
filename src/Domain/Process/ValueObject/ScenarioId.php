<?php

namespace App\Domain\Process\ValueObject;

use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\UuidValueTrait;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;

final class ScenarioId implements ValueObjectInterface
{
    use UuidValueTrait;
}
