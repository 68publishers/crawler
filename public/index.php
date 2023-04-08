<?php

declare(strict_types=1);

use App\Bootstrap;
use Apitte\Core\Application\IApplication as ApiApplication;

require __DIR__ . '/../vendor/autoload.php';

Bootstrap::boot()
    ->createContainer()
    ->getByType(ApiApplication::class)
    ->run();
