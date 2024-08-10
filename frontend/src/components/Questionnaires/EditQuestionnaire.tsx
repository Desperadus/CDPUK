// ./components/Questionnaires/EditQuestionnaire.tsx

import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
  } from "@chakra-ui/react"
  import { useMutation, useQueryClient } from "@tanstack/react-query"
  import { type SubmitHandler, useForm } from "react-hook-form"
  
  import {
    type ApiError,
    QuestionnairesService,
    type Questionnaire,
  } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  
  interface EditQuestionnaireProps {
    questionnaire: Questionnaire
    isOpen: boolean
    onClose: () => void
  }
  
  const EditQuestionnaire = ({
    questionnaire,
    isOpen,
    onClose,
  }: EditQuestionnaireProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting, isDirty },
    } = useForm<Questionnaire>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: questionnaire,
    })
  
    const mutation = useMutation({
      mutationFn: (data: Questionnaire) =>
        QuestionnairesService.updateQuestionnaire({ // Assuming a new QuestionnairesService.updateQuestionnaire() API call
          questionnaireId: questionnaire.id,
          requestBody: data,
        }),
      onSuccess: () => {
        showToast("Success!", "Questionnaire updated successfully.", "success")
        onClose()
      },
      onError: (err: ApiError) => {
        const errDetail = (err.body as any)?.detail
        showToast("Something went wrong.", `${errDetail}`, "error")
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["questionnaires"] })
      },
    })
  
    const onSubmit: SubmitHandler<Questionnaire> = async (data) => {
      mutation.mutate(data)
    }
  
    const onCancel = () => {
      reset()
      onClose()
    }
  
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={{ base: "sm", md: "md" }}
          isCentered
        >
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Edit Questionnaire</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.question}>
                <FormLabel htmlFor="question">Question</FormLabel>
                <Input
                  id="question"
                  {...register("question", {
                    required: "Question is required",
                  })}
                  type="text"
                />
                {errors.question && (
                  <FormErrorMessage>{errors.question.message}</FormErrorMessage>
                )}
              </FormControl>
              {/* Add more fields for 'answer', 'written_answer', 'notification_date' based on the questionnaire model */}
            </ModalBody>
            <ModalFooter gap={3}>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={!isDirty}
              >
                Save
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
  
  export default EditQuestionnaire