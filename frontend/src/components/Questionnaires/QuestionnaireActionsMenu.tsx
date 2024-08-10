import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
  } from "@chakra-ui/react"
  import { BsThreeDotsVertical } from "react-icons/bs"
  import { FiEdit, FiTrash } from "react-icons/fi"
  
  import type { Questionnaire } from "../../client"
  import EditQuestionnaire from "./EditQuestionnaire"
  import Delete from "../Common/DeleteAlert"
  
  interface QuestionnaireActionsMenuProps {
    questionnaire: Questionnaire;
    disabled?: boolean;
  }
  
  const QuestionnaireActionsMenu = ({ questionnaire, disabled }: QuestionnaireActionsMenuProps) => {
    const editModal = useDisclosure()
    const deleteModal = useDisclosure()
  
    return (
      <>
        <Menu>
          <MenuButton
            isDisabled={disabled}
            as={Button}
            rightIcon={<BsThreeDotsVertical />}
            variant="unstyled"
          />
          <MenuList>
            <MenuItem
              onClick={editModal.onOpen}
              icon={<FiEdit fontSize="16px" />}
            >
              Edit Questionnaire
            </MenuItem>
            <MenuItem
              onClick={deleteModal.onOpen}
              icon={<FiTrash fontSize="16px" />}
              color="ui.danger"
            >
              Delete Questionnaire
            </MenuItem>
          </MenuList>
          <EditQuestionnaire
            questionnaire={questionnaire} 
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
          <Delete
            type={"Questionnaire"}
            id={questionnaire.id} 
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.onClose}
          />
        </Menu>
      </>
    )
  }
  
  export default QuestionnaireActionsMenu;