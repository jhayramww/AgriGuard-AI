import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx(docx_path, output_path):
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return
    
    try:
        z = zipfile.ZipFile(docx_path)
        doc_xml = z.read('word/document.xml')
        root = ET.fromstring(doc_xml)
        
        paragraphs = []
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        # We can extract text from paragraphs and tables
        for elem in root.iter():
            if elem.tag.endswith('p'):
                # Extract text inside paragraph
                text = "".join(node.text for node in elem.iter() if node.tag.endswith('t') and node.text)
                if text.strip():
                    paragraphs.append(text)
            elif elem.tag.endswith('tr'):
                # Extract table rows
                row_text = []
                for cell in elem.iter():
                    if cell.tag.endswith('tc'):
                        cell_text = "".join(node.text for node in cell.iter() if node.tag.endswith('t') and node.text)
                        if cell_text.strip():
                            row_text.append(cell_text)
                if row_text:
                    paragraphs.append(" | ".join(row_text))
                    
        dirname = os.path.dirname(output_path)
        if dirname:
            os.makedirs(dirname, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n\n'.join(paragraphs))
        print(f"Extracted successfully to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    extract_docx('AgriGuard AI doc.docx', 'docx_content.txt')
