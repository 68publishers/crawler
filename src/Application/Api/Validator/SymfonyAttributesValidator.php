<?php

namespace App\Application\Api\Validator;

use Apitte\Core\Exception\Api\ValidationException;
use Apitte\Core\Mapping\Validator\IEntityValidator;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\Validation;

final class SymfonyAttributesValidator implements IEntityValidator
{
    public function __construct()
    {
    }

    public function validate($entity): void
    {
        $validator = Validation::createValidatorBuilder()->getValidator();

        /** @var ConstraintViolationInterface[] $violations */
        $violations = $validator->validate($entity);

        if (count($violations) > 0) {
            $fields = [];
            foreach ($violations as $violation) {
                $fields[$violation->getPropertyPath()][] = $violation->getMessage();
            }

            throw ValidationException::create()
                ->withFields($fields);
        }
    }

}
