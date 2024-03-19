// hooks/useDisclosure.js

import { useState } from 'react';

const useDisclosure = (defaultIsOpen = false) => {
    const [isOpen, setIsOpen] = useState(defaultIsOpen);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    const onToggle = () => setIsOpen(!isOpen);

    return { isOpen, onOpen, onClose, onToggle };
};

export default useDisclosure;
