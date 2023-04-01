<?php

namespace App\Scenario;

use Spatie\Crawler\CrawlProfiles\CrawlProfile;

final class ScenarioOptions
{
    public ?int $maxDepth = null;

    public ?int $totalCrawlLimit = null;

    public bool $respectRobots = false;

    public ?string $userAgent = null;

    public ?CrawlProfile $crawlProfile = null;

    public ?Viewport $viewport = null;

    public static function fromArray(array $array): self
    {
        $options = new self();

        if (isset($array['maxDepth'])) {
            $options->maxDepth = $array['maxDepth'];
        }

        if (isset($array['totalCrawlLimit'])) {
            $options->totalCrawlLimit = $array['totalCrawlLimit'];
        }

        if (isset($array['respectRobots'])) {
            $options->respectRobots = $array['respectRobots'];
        }

        if (isset($array['userAgent'])) {
            $options->userAgent = $array['userAgent'];
        }

        if (isset($array['crawlProfile'])) {
            $options->crawlProfile = $array['crawlProfile'];
        }

        if (isset($array['viewport'])) {
            $options->viewport = $array['viewport'];
        }

        return $options;
    }
}
