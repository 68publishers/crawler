<?php

namespace App\Domain\Process\ValueObject;

use SixtyEightPublishers\ArchitectureBundle\Domain\ValueObject\ValueObjectInterface;
use SixtyEightPublishers\ArchitectureBundle\Domain\Exception\InvalidNativeValueTypeException;

final class Actions implements ValueObjectInterface
{
    /**
     * @param array<Action> $items
     */
    private function __construct(
        private readonly array $items,
    ) {}

    public static function empty(): self
    {
        return new self([]);
    }

    public static function fromNative(mixed $native): static
    {
        if (!is_array($native)) {
            throw InvalidNativeValueTypeException::fromNativeValue(
                $native,
                sprintf('array<%s>', Action::class),
                self::class,
            );
        }

        $items = [];

        foreach ($native as $item) {
            $items[] = Action::fromNative($item);
        }

        return new self($items);
    }

    /**
     * @return array<int, array{name: string, parameters: array<mixed>}>
     */
    public function toNative(): array
    {
        return array_map(static fn (Action $action): array => $action->toNative(), $this->items);
    }

    public function equals(ValueObjectInterface $object): bool
    {
        if (!$object instanceof self) {
            return false;
        }

        $left = $object->all();
        $right = $this->all();

        if (count($left) !== count($right)) {
            return false;
        }

        foreach ($left as $i => $action) {
            if (!isset($right[$i]) || !$action->equals($right[$i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<Action>
     */
    public function all(): array
    {
        return $this->items;
    }
}
