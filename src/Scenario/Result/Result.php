<?php

namespace App\Scenario\Result;

use JsonSerializable;

final class Result implements JsonSerializable
{
    /** @var array<string> */
    private array $visitedUrls = [];

    /** @var array<VisitError> */
    private array $visitErrors = [];

    /** @var array<Cookie> */
    private array $cookies = [];

    public function withCookie(Cookie $cookie): self
    {
        foreach ($this->cookies as $c) {
            if ($c->equals($cookie)) {
                return $this;
            }
        }

        $result = clone $this;
        $result->cookies[] = $cookie;

        return $result;
    }

    public function withVisitedUrl(string $url): self
    {
        if (in_array($url, $this->visitedUrls, true)) {
            return $this;
        }

        $result = clone $this;
        $result->visitedUrls[] = $url;

        return $result;
    }

    public function withVisitError(VisitError $visitError): self
    {
        foreach ($this->visitErrors as $v) {
            if ($v->equals($visitError)) {
                return $this;
            }
        }

        $result = clone $this;
        $result->visitErrors[] = $visitError;

        return $result;
    }

    public function merge(self $result): self
    {
        $mergedResult = clone $this;

        foreach ($result->getCookies() as $cookie) {
            $mergedResult = $mergedResult->withCookie($cookie);
        }

        foreach ($result->getVisitedUrls() as $visitedUrl) {
            $mergedResult = $mergedResult->withVisitedUrl($visitedUrl);
        }

        foreach ($result->getVisitErrors() as $visitError) {
            $mergedResult = $mergedResult->withVisitError($visitError);
        }

        return $mergedResult;
    }

    /**
     * @return array<Cookie>
     */
    public function getCookies(): array
    {
        return $this->cookies;
    }

    /**
     * @return array<string>
     */
    public function getVisitedUrls(): array
    {
        return $this->visitedUrls;
    }

    /**
     * @return array<VisitError>
     */
    public function getVisitErrors(): array
    {
        return $this->visitErrors;
    }

    /**
     * @return array{visitedUrls: array<string>, visitErrors: array<VisitError>, cookies: array<Cookie>}
     */
    public function jsonSerialize(): array
    {
        return [
            'visitedUrls' => $this->visitedUrls,
            'visitErrors' => $this->visitErrors,
            'cookies' => $this->cookies,
        ];
    }
}
