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
  Text,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { MentorsService, type Mentor } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import AddMentor from "../../components/Mentors/AddMentor";

const mentorsSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/mentors")({
  component: Mentors,
  validateSearch: (search) => mentorsSearchSchema.parse(search),
});

const PER_PAGE = 5;

function getMentorsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () => MentorsService.getMentors(),
    queryKey: ["mentors", { page }],
  };
}

function MentorsTable() {
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: mentors = [], isPending, isPlaceholderData } = useQuery({
    ...getMentorsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && mentors.length === PER_PAGE;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getMentorsQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Mentor Email</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              {new Array(5).fill(null).map((_, index) => (
                <Tr key={index}>
                  <Td>
                    <Flex>
                      <Skeleton height="20px" width="20px" />
                    </Flex>
                  </Td>
                  <Td>
                    <Flex>
                      <Skeleton height="20px" width="20px" />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          ) : (
            <Tbody>
              {mentors.map((mentor: Mentor, index: number) => (
                <Tr key={index} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>
                    <Text>{mentor.mentor_email}</Text>
                  </Td>
                  <Td>
                    <ActionsMenu
                      type={"Mentor"}
                      value={{ ...mentor, id: Number(mentor.id) }} // Assuming ActionsMenu expects string IDs
                    />
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
        <Button
          onClick={() =>
            navigate({ to: "/mentors", search: { page: page - 1 } })
          }
          isDisabled={page <= 1}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          isDisabled={!hasNextPage}
          onClick={() =>
            navigate({ to: "/mentors", search: { page: page + 1 } })
          }
        >
          Next
        </Button>
      </Flex>
    </>
  );
}

function Mentors() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Mentors Management
      </Heading>

      <Navbar type={"Mentor"} addModalAs={AddMentor} />
      <MentorsTable />
    </Container>
  );
}

export default Mentors;