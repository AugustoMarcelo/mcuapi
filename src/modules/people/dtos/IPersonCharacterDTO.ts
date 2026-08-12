import ICharacter from '@modules/characters/entities/ICharacter';

type IPersonCharacterDTO = ICharacter & { recast_order: number };

export default IPersonCharacterDTO;
