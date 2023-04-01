<?php

namespace App\Browsershot;

interface BrowsershotFactoryInterface
{
    public function create(): Browsershot;
}
