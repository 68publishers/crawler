<?php

namespace App\Scenario;

use Nette\Utils\FileSystem;
use Psr\Log\LoggerInterface;
use App\Scenario\Result\Result;
use Spatie\Crawler\Crawler;
use App\Scenario\Action\ActionInterface;
use App\Scenario\Handler\CrawlRequestFailed;
use App\Scenario\Handler\CrawlRequestFulfilled;
use App\Browsershot\BrowsershotFactoryInterface;

final class Scenario implements ScenarioInterface
{
    /**
     * @param array<ActionInterface> $actions
     */
    public function __construct(
        private readonly string $name,
        private readonly string $url,
        private readonly array $actions,
        private readonly ScenarioOptions $options,
        private readonly BrowsershotFactoryInterface $browsershotFactory,
    ) {}

    public function run(string $runtimeId, LoggerInterface $logger): Result
    {
        $observer = new CrawlObserver($this->name, $logger);
        $browsershot = $this->browsershotFactory->create();

        $browsershot->waitUntilNetworkIdle();

        if (null !== $this->options->userAgent) {
            $browsershot->userAgent($this->options->userAgent);
        }

        if (null !== $this->options->viewport) {
            $browsershot->windowSize($this->options->viewport->width, $this->options->viewport->height);
        }

        foreach ($this->actions as $action) {
            $action->apply($browsershot);
        }

        $screenshotsDir = realpath(__DIR__ . '/../../var/screenshots') . '/' . $runtimeId;

        FileSystem::createDir($screenshotsDir);
        $browsershot->setOption('screenshotsDir', $screenshotsDir);

        $crawler = Crawler::create([
            'allow_redirects' => true,
        ])->setCrawlObserver($observer)
            ->executeJavaScript()
            ->setBrowsershot($browsershot)
            ->setConcurrency(10)
            ->setCrawlFulfilledHandlerClass(CrawlRequestFulfilled::class)
            ->setCrawlFailedHandlerClass(CrawlRequestFailed::class)
            ->setDelayBetweenRequests(1000);

        if (null !== $this->options->maxDepth) {
            $crawler->setMaximumDepth($this->options->maxDepth);
        }

        if (null !== $this->options->totalCrawlLimit) {
            $crawler->setTotalCrawlLimit($this->options->totalCrawlLimit);
        }

        if (null !== $this->options->crawlProfile) {
            $crawler->setCrawlProfile($this->options->crawlProfile);
        }

        if (null !== $this->options->userAgent) {
            $crawler->setUserAgent($this->options->userAgent);
        }

        if ($this->options->respectRobots) {
            $crawler->respectRobots();
        } else {
            $crawler->ignoreRobots();
        }

        $logger->info(sprintf(
            '[%s] Scenario started.',
            $this->name,
        ));

        $crawler->startCrawling($this->url);

        $logger->info(sprintf(
            '[%s] Scenario finished.',
            $this->name
        ));

        return $observer->getResult();
    }
}
