<?php

declare(strict_types=1);

namespace App\Application\Api\Controller;

use Apitte\Core\UI\Controller\IController;
use Apitte\Core\Annotation\Controller\Path;

#[Path("/api")]
abstract class AbstractController implements IController
{
}
