<?php

namespace App\Domain\Process\ValueObject;

enum Status: string
{
    case WAITING = 'waiting';
    case FINISHED = 'finished';
}
