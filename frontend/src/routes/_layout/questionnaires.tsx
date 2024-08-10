import {
  Container,
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { QuestionnairesService, type Questionnaire } from "../../client"
import Navbar from "../../components/Common/Navbar"
import AddQuestionnaire from "../../components/Questionnaires/AddQuestionnaire"
import QuestionnaireActionsMenu from "../../components/Questionnaires/QuestionnaireActionsMenu";

const questionnairesSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/questionnaires")({ // Correct path
  component: Questionnaires,
  validateSearch: (search) => questionnairesSearchSchema.parse(search),
})

const PER_PAGE = 5

function getQuestionnairesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () => QuestionnairesService.getQuestionnaires(),
    queryKey: ["questionnaires", { page }],
  }
}

function QuestionnairesTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Removed unused setPage variable

  const { data: questionnaires, isPending, isPlaceholderData } = useQuery({
    ...getQuestionnairesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage =
    !isPlaceholderData && questionnaires?.length === PER_PAGE;
  
  // Removed unused hasPreviousPage variable

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getQuestionnairesQueryOptions({ page: page + 1 }),
      )
    }
  }, [page, queryClient])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Question</Th>
              <Th>Answer</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              {new Array(5).fill(null).map((_, index) => (
                <Tr key={index}>
                  {new Array(3).fill(null).map((_, index) => (
                    <Td key={index}>
                      <Flex>
                        <Skeleton height="20px" width="20px" />
                      </Flex>
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          ) : (
            <Tbody>
              {questionnaires?.map((questionnaire: Questionnaire, index: number) => (
                <Tr key={index} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{questionnaire.question}</Td>
                  <Td>
                    {questionnaire.answer === true
                      ? "Yes"
                      : questionnaire.answer === false
                      ? "No"
                      : "N/A"}
                  </Td>
                  <Td>
                    <QuestionnaireActionsMenu questionnaire={questionnaire} /> 
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Flex
        gap={4}
        alignItems="center"
        mt={4}
        direction="row"
        justifyContent="flex-end"
      >
        <Button onClick={() => navigate({ to: "/questionnaires", search: { page: page - 1 } })} isDisabled={page <= 1}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => navigate({ to: "/questionnaires", search: { page: page + 1 } })}>
          Next
        </Button>
      </Flex>
    </>
  )
}
  
  function Questionnaires() {
    return (
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Questionnaires
        </Heading>
  
        <Navbar type={"Questionnaire"} addModalAs={AddQuestionnaire} />
        <QuestionnairesTable />
      </Container>
    )
  }