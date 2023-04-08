<?php

namespace App\Domain\Process;

use App\Domain\Process\ValueObject\Status;
use Doctrine\Common\Collections\Collection;
use App\Domain\Process\ValueObject\ProcessId;
use SixtyEightPublishers\ArchitectureBundle\Domain\AggregateRootTrait;
use SixtyEightPublishers\ArchitectureBundle\Domain\AggregateRootInterface;
use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\AggregateId;

final class Process implements AggregateRootInterface
{
    use AggregateRootTrait;

    private ProcessId $id;

    private Status $status;

    private Collection $scenarios;

    public function getAggregateId(): AggregateId
    {
        return AggregateId::fromUuid($this->id->toUuid());
    }
}
