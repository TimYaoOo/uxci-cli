import * as React from 'react'
import './info.css'

class Info extends React.Component {
    render() {
        const { info, idx, delItem } = this.props;
      return (
        <tr >
            <td className="tr border-l-b-1">{info.id}</td>
            <td className="tr border-l-b-1">{info.name}</td>
            <td className="tr border-l-b-1">{info.templateType}</td>
            <td className="tr border-l-b-1">
                <button >查看</button>
                <button onClick={delItem(idx)}>删除</button>
            </td>
        </tr>
      );
    }
    
  }
  
  export default Info;
  