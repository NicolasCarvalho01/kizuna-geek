"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Editor rich-text Tiptap pro admin — gera HTML.
 *
 * Permite: negrito, itálico, riscado, h2/h3, lista, lista numerada,
 * blockquote, link, separator, undo/redo.
 *
 * Saída é HTML simples (sanitizado pela whitelist do Tiptap StarterKit),
 * pronto pra `dangerouslySetInnerHTML` na página do produto.
 *
 * SSR: useEditor com immediatelyRender:false evita hydration mismatch.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Conte a história do produto…",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // h1 fica na página, evita conflito com SEO
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-[color:var(--color-gold)] underline underline-offset-2",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false, // SSR safety (Next App Router)
    editorProps: {
      attributes: {
        class: cn(
          "prose-tiptap min-h-[200px] px-4 py-3 focus:outline-none",
          "text-[0.9375rem] leading-[1.65]",
          "[&_h2]:font-[var(--font-display)] [&_h2]:text-[1.375rem] [&_h2]:mt-5 [&_h2]:mb-2",
          "[&_h3]:font-[var(--font-display)] [&_h3]:text-[1.125rem] [&_h3]:mt-4 [&_h3]:mb-2",
          "[&_p]:mb-3 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--color-gold)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_hr]:border-[color:var(--color-hairline)] [&_hr]:my-5",
        ),
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      // Tiptap retorna "<p></p>" pra editor vazio — normaliza
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Quando value externa muda (ex: reset do form), sincroniza
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "<p></p>";
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[260px] rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] animate-pulse bg-[color:var(--color-bg-elevated)]/50" />
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)]",
        "focus-within:border-[color:var(--color-gold)] transition-colors",
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOOLBAR
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]",
        "transition-colors duration-[var(--motion-fast)]",
        "text-[color:var(--color-fg-soft)]",
        "hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active &&
          "bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = React.useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[color:var(--color-hairline)] bg-[color:var(--color-bg-elevated)]/50">
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        title="Título 2"
      >
        <Heading2 className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        title="Título 3"
      >
        <Heading3 className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>

      <span
        aria-hidden
        className="mx-1 h-5 w-px bg-[color:var(--color-hairline)]"
      />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Riscado"
      >
        <Strikethrough className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title="Inserir/editar link"
      >
        <LinkIcon className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>

      <span
        aria-hidden
        className="mx-1 h-5 w-px bg-[color:var(--color-hairline)]"
      />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista com marcadores"
      >
        <List className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Citação"
      >
        <Quote className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Separador"
      >
        <Minus className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>

      <span
        aria-hidden
        className="mx-1 h-5 w-px bg-[color:var(--color-hairline)]"
      />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" strokeWidth={1.5} />
      </ToolbarButton>
    </div>
  );
}
