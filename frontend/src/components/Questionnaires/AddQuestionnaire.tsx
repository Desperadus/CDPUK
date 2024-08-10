// ./components/Questionnaires/AddQuestionnaire.tsx

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
    type QuestionnaireCreate,
  } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  
  interface AddQuestionnaireProps {
    isOpen: boolean
    onClose: () => void
  }
  
  const AddQuestionnaire = ({ isOpen, onClose }: AddQuestionnaireProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<QuestionnaireCreate>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        question: "",
        answer: null,
        written_answer: "",
        notification_date: null, // Handle date input if needed
      },
    })
  
    const mutation = useMutation({
      mutationFn: (data: QuestionnaireCreate) =>
        QuestionnairesService.createQuestionnaire({ requestBody: data }), // Assuming a new QuestionnairesService.createQuestionnaire() API call
      onSuccess: () => {
        showToast("Success!", "Questionnaire created successfully.", "success")
        reset()
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
  
    const onSubmit: SubmitHandler<QuestionnaireCreate> = (data) => {
      mutation.mutate(data)
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
            <ModalHeader>Add Questionnaire</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired isInvalid={!!errors.question}>
                <FormLabel htmlFor="question">Question</FormLabel>
                <Input
                  id="question"
                  {...register("question", {
                    required: "Question is required.",
                  })}
                  placeholder="Question"
                  type="text"
                />
                {errors.question && (
                  <FormErrorMessage>{errors.question.message}</FormErrorMessage>
                )}
              </FormControl>
              {/* Add more fields for 'answer', 'written_answer', 'notification_date' based on the questionnaire model */}
            </ModalBody>
  
            <ModalFooter gap={3}>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
  
  export default AddQuestionnaire