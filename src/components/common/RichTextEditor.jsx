import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { Bold, Italic, List, ListOrdered, Undo, Redo, AtSign } from 'lucide-react';
import { useState } from 'react';

export const RichTextEditor = ({
    content,
    onChange,
    placeholder = 'Write a comment...',
    onMention,
    users = []
}) => {
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention',
                },
                suggestion: {
                    items: ({ query }) => {
                        return users
                            .filter(user =>
                                user.name.toLowerCase().includes(query.toLowerCase()) ||
                                user.email.toLowerCase().includes(query.toLowerCase())
                            )
                            .slice(0, 5);
                    },
                    render: () => {
                        let component;
                        let popup;

                        return {
                            onStart: props => {
                                component = new MentionList(props);
                                if (!props.clientRect) return;

                                popup = document.createElement('div');
                                popup.className = 'mention-suggestions';
                                document.body.appendChild(popup);
                                component.render(popup);
                            },
                            onUpdate(props) {
                                component.update(props);
                                if (!props.clientRect) return;
                            },
                            onKeyDown(props) {
                                if (props.event.key === 'Escape') {
                                    popup?.remove();
                                    return true;
                                }
                                return component.onKeyDown(props);
                            },
                            onExit() {
                                popup?.remove();
                                component.destroy();
                            },
                        };
                    },
                },
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-3',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('bold')
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('italic')
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('bulletList')
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('orderedList')
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    title="Ordered List"
                >
                    <ListOrdered size={16} />
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
                <div className="flex-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <AtSign size={14} /> Type @ to mention
                </span>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
};

// Simple mention list component
class MentionList {
    constructor(props) {
        this.props = props;
        this.items = props.items;
        this.selectedIndex = 0;
    }

    render(el) {
        el.innerHTML = `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                ${this.items.map((item, index) => `
                    <div 
                        class="mention-item px-4 py-2 cursor-pointer transition-colors ${index === this.selectedIndex
                ? 'bg-indigo-100 dark:bg-indigo-900/50'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }"
                        data-index="${index}"
                    >
                        <div class="font-medium text-slate-900 dark:text-slate-100">${item.name}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">${item.email}</div>
                    </div>
                `).join('')}
            </div>
        `;

        el.querySelectorAll('.mention-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectItem(index);
            });
        });
    }

    update(props) {
        this.props = props;
        this.items = props.items;
    }

    onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
            this.upHandler();
            return true;
        }
        if (event.key === 'ArrowDown') {
            this.downHandler();
            return true;
        }
        if (event.key === 'Enter') {
            this.enterHandler();
            return true;
        }
        return false;
    }

    upHandler() {
        this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
    }

    downHandler() {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    }

    enterHandler() {
        this.selectItem(this.selectedIndex);
    }

    selectItem(index) {
        const item = this.items[index];
        if (item) {
            this.props.command({ id: item.id, label: item.name });
        }
    }

    destroy() {
        // Cleanup if needed
    }
}
