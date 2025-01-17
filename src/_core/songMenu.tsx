import {
  Download,
  EllipsisVertical,
  Info,
  ListEnd,
  ListPlus,
  ListStart,
  Play,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdownMenu';
import { IconButton } from './iconButton';

export default function SongMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={<EllipsisVertical />} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <Play />
          Play now
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <ListStart />
          Play next
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <ListEnd />
          Play last
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <ListPlus />
          Add to Playlist&hellip;
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <Info />
          Info
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('TODO');
          }}
        >
          <Download />
          Download
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
