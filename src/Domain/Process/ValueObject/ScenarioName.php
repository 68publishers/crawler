<?php

namespace App\Domain\Process\ValueObject;

use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\StringValueTrait;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;

final class ScenarioName implements ValueObjectInterface
{
    use StringValueTrait;
}
