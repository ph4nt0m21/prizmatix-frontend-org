import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './mentionList';

const DECORATORS = [
  "@AddToCalendar", "@EventName", "@OrganiserName",
  "@FirstName", "@LastName", "@OrderNumber"
];

const suggestion = {
  items: ({ query }) => {
    // If you fetch from a backend, you can do it here.
    return DECORATORS
      .filter(item => item.toLowerCase().startsWith(`@${query.toLowerCase()}`))
      .slice(0, 7); // Show up to 7 suggestions
  },

  render: () => {
    let component;
    let popup;

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export default suggestion;