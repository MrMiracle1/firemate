import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validateNote, truncateNote, VALIDATION_RULES, VALIDATION_MESSAGES } from '../../src/lib/validation';

const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
};

interface NoteEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => Promise<void>;
  initialNote?: string;
  loading?: boolean;
}

export default function NoteEditor({
  visible,
  onClose,
  onSave,
  initialNote = '',
  loading = false,
}: NoteEditorProps) {
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setNote(initialNote);
      setError(null);
    }
  }, [visible, initialNote]);

  const handleNoteChange = (text: string) => {
    // 截断超过限制的文字
    const truncated = truncateNote(text);
    setNote(truncated);

    // 实时校验
    const validation = validateNote(truncated);
    setError(validation.valid ? null : validation.error || null);
  };

  const handleSave = async () => {
    const validation = validateNote(note);
    if (!validation.valid) {
      setError(validation.error || null);
      return;
    }

    setSaving(true);
    try {
      await onSave(note);
      onClose();
    } catch (err) {
      Alert.alert('保存失败', '是否重试？', [
        { text: '取消', style: 'cancel' },
        { text: '重试', onPress: handleSave },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const charCount = note.length;
  const maxChars = VALIDATION_RULES.NOTE_MAX_LENGTH;
  const isOverLimit = charCount > maxChars;
  const isAtLimit = charCount === maxChars;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>添加备注</Text>
            <View style={styles.placeholder} />
          </View>

          {/* 备注输入 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.noteInput, error && styles.noteInputError]}
              value={note}
              onChangeText={handleNoteChange}
              placeholder="请输入备注..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={maxChars}
              autoFocus
            />
          </View>

          {/* 字符计数 */}
          <View style={styles.charCountContainer}>
            <Text
              style={[
                styles.charCountText,
                isOverLimit && styles.charCountError,
                isAtLimit && styles.charCountWarning,
              ]}
            >
              {charCount}/{maxChars}
            </Text>
          </View>

          {/* 错误提示 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    minHeight: 120,
  },
  noteInput: {
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  noteInputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCountText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  charCountWarning: {
    color: colors.warning,
  },
  charCountError: {
    color: colors.danger,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 17,
    fontWeight: '600',
  },
});
