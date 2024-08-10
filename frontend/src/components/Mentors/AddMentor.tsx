// ./components/Mentors/AddMentor.tsx

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
  
  import { type ApiError, MentorsService } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  import { emailPattern } from "../../utils"
  
  interface AddMentorProps {
    isOpen: boolean
    onClose: () => void
  }
  
  interface AddMentorForm {
    mentor_email: string
  }
  
  const AddMentor = ({ isOpen, onClose }: AddMentorProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<AddMentorForm>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        mentor_email: "",
      },
    })
  
    const mutation = useMutation({
      mutationFn: (data: AddMentorForm) => MentorsService.assignMentor(data), // Assuming a new MentorsService.assignMentor() API call
      onSuccess: () => {
        showToast("Success!", "Mentor assigned successfully.", "success")
        reset()
        onClose()
      },
      onError: (err: ApiError) => {
        const errDetail = (err.body as any)?.detail
        showToast("Something went wrong.", `${errDetail}`, "error")
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["mentors"] })
      },
    })
  
    const onSubmit: SubmitHandler<AddMentorForm> = (data) => {
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
            <ModalHeader>Add Mentor</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired isInvalid={!!errors.mentor_email}>
                <FormLabel htmlFor="mentor_email">Mentor Email</FormLabel>
                <Input
                  id="mentor_email"
                  {...register("mentor_email", {
                    required: "Mentor email is required.",
                    pattern: emailPattern,
                  })}
                  placeholder="Mentor Email"
                  type="email"
                />
                {errors.mentor_email && (
                  <FormErrorMessage>
                    {errors.mentor_email.message}
                  </FormErrorMessage>
                )}
              </FormControl>
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
  
  export default AddMentor