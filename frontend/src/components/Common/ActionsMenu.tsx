import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash } from "react-icons/fi";

import type { ItemPublic, UserPublic, Questionnaire, Mentor } from "../../client";
import EditUser from "../Admin/EditUser";
import EditItem from "../Items/EditItem";
import Delete from "./DeleteAlert";
import EditQuestionnaire from "../../components/Questionnaires/EditQuestionnaire"; 

interface ActionsMenuProps {
  type: string;
  value: ItemPublic | UserPublic | Questionnaire | Mentor;
  disabled?: boolean;
  editModalAs?: React.ComponentType<any>;
}

const ActionsMenu = ({ type, value, disabled, editModalAs = EditItem }: ActionsMenuProps) => {
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();

  const EditModalComponent = type === "User" ? EditUser : type === "Questionnaire" ? EditQuestionnaire : editModalAs;

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={IconButton}
          aria-label="Options"
          icon={<BsThreeDotsVertical />}
          variant="ghost"
        />
        <MenuList>
          {type !== "Pokus" && (
            <MenuItem onClick={editModal.onOpen} icon={<FiEdit fontSize="16px" />}>
              Edit {type}
            </MenuItem>
          )}
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
      </Menu>
      {type !== "Pokus666" && (
        <EditModalComponent
          // Pass props dynamically based on type
          {...(type === "User" && { user: value as UserPublic })}
          {...(type === "Item" && { item: value as ItemPublic })}
          {...(type === "Questionnaire" && { questionnaire: value })}
          {...(type === "Mentor" && { mentor: value as Mentor })}
          isOpen={editModal.isOpen}
          onClose={editModal.onClose}
        />
      )}
      <Delete
        type={type}
        id={value.id} 
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
      />
    </>
  );
};

export default ActionsMenu;